import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import seed from "../../../../data/attribute-definitions.seed.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getTestApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (projectId !== "oodlesnet-test") {
    throw new Error("Attribute registry is locked to oodlesnet-test.");
  }
  if (!clientEmail || !privateKey) {
    throw new Error("Test Firebase Admin credentials are not configured.");
  }
  return getApps().find((app) => app.name === "oodlesnet-test-attribute-reader") ??
    initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey }), projectId },
      "oodlesnet-test-attribute-reader"
    );
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function sameDefinition(expected, current) {
  const fields = ["key", "label", "aliases", "dataType", "unit", "appliesTo", "comparison", "filterable", "comparable", "active"];
  const project = (source) => Object.fromEntries(fields
    .filter((field) => source[field] !== undefined)
    .map((field) => [field, source[field]]));
  return JSON.stringify(stable(project(expected))) === JSON.stringify(stable(project(current || {})));
}

export async function GET(request) {
  let app;
  try {
    app = getTestApp();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Test configuration error." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, error: "Firebase ID token required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const allowlist = (process.env.TEST_WRITER_ADMIN_UIDS || "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (!allowlist.length) {
    return NextResponse.json({ ok: false, error: "Test admin allowlist is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(decoded.uid)) {
      return NextResponse.json({ ok: false, error: "Administrator access required." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Firebase ID token is invalid or expired." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    if (seed.collection !== "attribute_definitions" || !Array.isArray(seed.definitions)) {
      throw new Error("Invalid bundled attribute seed.");
    }
    const snapshot = await getFirestore(app).collection("attribute_definitions").get();
    const existing = new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]));
    const actions = seed.definitions.map((definition) => {
      const current = existing.get(definition.key);
      return {
        id: definition.key,
        label: definition.label,
        action: !current ? "create" : sameDefinition(definition, current) ? "unchanged" : "update",
      };
    });
    const summary = actions.reduce((counts, item) => {
      counts[item.action] += 1;
      return counts;
    }, { create: 0, update: 0, unchanged: 0 });
    const seedIds = new Set(actions.map((item) => item.id));
    const untouchedExistingIds = [...existing.keys()].filter((id) => !seedIds.has(id));
    return NextResponse.json(
      {
        ok: true,
        mode: "dry-run",
        project: "oodlesnet-test",
        collection: "attribute_definitions",
        seedCount: actions.length,
        existingCount: existing.size,
        summary,
        actions,
        untouchedExistingIds,
        writesPerformed: 0,
        readOnly: true,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Could not audit TEST attribute definitions." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request) {
  let app;
  try {
    app = getTestApp();
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Test configuration error." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, error: "Firebase ID token required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const allowlist = (process.env.TEST_WRITER_ADMIN_UIDS || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (!allowlist.length) {
    return NextResponse.json({ ok: false, error: "Test admin allowlist is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(decoded.uid)) {
      return NextResponse.json({ ok: false, error: "Administrator access required." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Firebase ID token is invalid or expired." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body.confirm !== "CREATE_MISSING_ATTRIBUTE_DEFINITIONS") {
      return NextResponse.json({ ok: false, error: "Explicit seed confirmation is required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (seed.collection !== "attribute_definitions" || !Array.isArray(seed.definitions) || seed.definitions.length !== 20) {
      throw new Error("Unexpected bundled seed.");
    }

    const db = getFirestore(app);
    const collection = db.collection("attribute_definitions");
    const before = await collection.get();
    const existing = new Set(before.docs.map((doc) => doc.id));
    const missing = seed.definitions.filter((definition) => !existing.has(definition.key));
    if (missing.length > 450) {
      return NextResponse.json({ ok: false, error: "Seed exceeds safe batch limit." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const batch = db.batch();
    for (const definition of missing) {
      const ref = collection.doc(definition.key);
      batch.create(ref, definition);
    }
    if (missing.length) await batch.commit();

    const after = await collection.get();
    const verifiedIds = new Set(after.docs.map((doc) => doc.id));
    const missingAfter = seed.definitions.filter((definition) => !verifiedIds.has(definition.key)).map((definition) => definition.key);
    return NextResponse.json({
      ok: missingAfter.length === 0,
      mode: "seed",
      project: "oodlesnet-test",
      collection: "attribute_definitions",
      attemptedCreates: missing.length,
      createdIds: missing.map((definition) => definition.key),
      existingRecordsPreserved: before.size,
      verifiedSeedCount: seed.definitions.length - missingAfter.length,
      missingAfter,
      writesPerformed: missing.length,
      readOnly: false,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Seed operation failed. Existing records were not intentionally overwritten." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
