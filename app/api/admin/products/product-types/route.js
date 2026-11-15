import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getTestApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (projectId !== "oodlesnet-test") throw new Error("Product type editor is locked to oodlesnet-test.");
  if (!clientEmail || !privateKey) throw new Error("TEST Firebase Admin credentials are not configured.");
  return getApps().find((app) => app.name === "oodlesnet-product-type-editor") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, "oodlesnet-product-type-editor");
}

async function authorize(request) {
  const app = getTestApp();
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return { error: "Firebase ID token required.", status: 401 };
  const allowlist = (process.env.TEST_WRITER_ADMIN_UIDS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!allowlist.length) return { error: "TEST admin allowlist is not configured.", status: 503 };
  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(decoded.uid)) return { error: "Administrator access required.", status: 403 };
    return { app };
  } catch {
    return { error: "Firebase ID token is invalid or expired.", status: 401 };
  }
}

export async function GET(request) {
  let auth;
  try { auth = await authorize(request); }
  catch (error) { return NextResponse.json({ ok: false, error: error.message || "TEST configuration error." }, { status: 503 }); }
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  try {
    const snapshot = await getFirestore(auth.app).collection("products").get();
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        brand: data.brand || "",
        categorySlug: data.categorySlug || "",
        productType: data.productType || "",
        subcategory: data.subcategory || "",
        imageUrl: data.imageUrl || "",
      };
    });
    return NextResponse.json({
      ok: true, project: "oodlesnet-test", count: products.length, products,
      unassignedCount: products.filter((p) => !p.productType.trim()).length,
      readOnly: true, writesPerformed: 0,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not read TEST products." }, { status: 500 });
  }
}

export async function POST(request) {
  let auth;
  try { auth = await authorize(request); }
  catch (error) { return NextResponse.json({ ok: false, error: error.message || "TEST configuration error." }, { status: 503 }); }
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  try {
    const body = await request.json().catch(() => ({}));
    if (body.mode === "repair-known-malformed-slugs") {
      if (body.confirm !== "REPAIR_KNOWN_MALFORMED_TEST_PRODUCT_TYPES") {
        return NextResponse.json({ ok: false, error: "Explicit repair confirmation is required." }, { status: 400 });
      }
      const repairs = {
        "neaker": "sneakers",
        "wirele-earbud": "wireless-earbuds",
        "martphone": "smartphone",
        "fitne-band": "fitness-band",
        "face-erum": "face-serum",
        "face-wa-h": "face-wash",
        "un-creen": "sunscreen",
        "moi-turizer": "moisturizer",
        "running-hoe": "running-shoes",
        "peaker": "speaker",
        "t-hirt": "t-shirts",
        "hampoo": "shampoo",
        "jean": "jeans",
      };
      const snapshot = await getFirestore(auth.app).collection("products").get();
      const targets = snapshot.docs.filter((doc) => Object.hasOwn(repairs, String(doc.data().productType || "")));
      if (!targets.length) {
        return NextResponse.json({ ok: true, mode: "repair-known-malformed-slugs", project: "oodlesnet-test", updatedCount: 0, assignments: [], writesPerformed: 0, readOnly: true });
      }
      const batch = getFirestore(auth.app).batch();
      const assignments = targets.map((doc) => ({ id: doc.id, previous: doc.data().productType, productType: repairs[doc.data().productType] }));
      assignments.forEach((item) => batch.update(getFirestore(auth.app).collection("products").doc(item.id), { productType: item.productType }));
      await batch.commit();
      return NextResponse.json({ ok: true, mode: "repair-known-malformed-slugs", project: "oodlesnet-test", updatedCount: assignments.length, assignments, writesPerformed: assignments.length, readOnly: false }, { headers: { "Cache-Control": "no-store" } });
    }
    const assignments = body.assignments;
    if (body.confirm !== "UPDATE_TEST_PRODUCT_TYPES" || !Array.isArray(assignments) || assignments.length < 1 || assignments.length > 100) {
      return NextResponse.json({ ok: false, error: "Explicit confirmation and 1–100 assignments are required." }, { status: 400 });
    }
    const normalized = assignments.map((item) => ({
      id: String(item?.id || "").trim(),
      productType: String(item?.productType || "").trim().toLowerCase().replace(/&/g, "and").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
    }));
    if (normalized.some((x) => !x.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.productType)) ||
        new Set(normalized.map((x) => x.id)).size !== normalized.length) {
      return NextResponse.json({ ok: false, error: "Each product needs a unique ID and a valid product type slug." }, { status: 400 });
    }
    const db = getFirestore(auth.app);
    const refs = normalized.map((x) => db.collection("products").doc(x.id));
    const snapshots = await db.getAll(...refs);
    const missing = snapshots.filter((s) => !s.exists).map((s) => s.id);
    if (missing.length) return NextResponse.json({ ok: false, error: "Unknown product IDs.", missing }, { status: 404 });
    const batch = db.batch();
    normalized.forEach((item, index) => batch.update(refs[index], { productType: item.productType }));
    await batch.commit();
    return NextResponse.json({
      ok: true, mode: "update-product-types", project: "oodlesnet-test",
      updatedCount: normalized.length, assignments: normalized,
      writesPerformed: normalized.length, readOnly: false,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update TEST product types." }, { status: 500 });
  }
}
