import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { validateImportBatch } from "@/lib/product-import.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEST_PROJECT_ID = "oodlesnet-test";
const MAX_BODY_BYTES = 250_000;
const MAX_PRODUCTS = 100;

function fail(message, status) {
  return NextResponse.json({ ok: false, error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalizePrivateKey(raw) {
  let key = String(raw || "").trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function getTestAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (projectId !== TEST_PROJECT_ID) {
    throw new Error("Bulk importer is disabled: Firebase project is not the fixed test project.");
  }
  if (!clientEmail || !privateKey) throw new Error("Test Firebase Admin credentials are not configured.");
  const name = "oodlesnet-test-bulk-product-importer";
  return getApps().find((app) => app.name === name) ?? initializeApp({
    credential: cert({ projectId: TEST_PROJECT_ID, clientEmail, privateKey }),
    projectId: TEST_PROJECT_ID,
  }, name);
}

function requireTestWriterToken(request) {
  const expected = process.env.TEST_WRITER_TOKEN || "";
  const header = request.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected) return { error: fail("Test writer token is not configured for this Preview deployment.", 503) };
  if (!supplied || supplied.length !== expected.length) return { error: fail("Unauthorized.", 401) };
  // Constant-time comparison for equal-length secrets.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  if (diff !== 0) return { error: fail("Unauthorized.", 401) };
  return { uid: "test-token-authorized" };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "oodlesnet-test-bulk-product-importer",
    projectLocked: TEST_PROJECT_ID,
    diagnostics: {
      tokenConfigured: Boolean(process.env.TEST_WRITER_TOKEN),
      configuredProjectMatchesTest: process.env.FIREBASE_PROJECT_ID === TEST_PROJECT_ID,
      clientEmailConfigured: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
      privateKeyConfigured: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      adminAllowlistConfigured: Boolean(process.env.TEST_WRITER_ADMIN_UIDS?.trim()),
    },
    mode: "dry-run by default",
    maxProducts: MAX_PRODUCTS,
    maxBodyBytes: MAX_BODY_BYTES,
    writeRequirements: ["test-only bearer token", "confirmWrite=true"],
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return fail("Request exceeds the 250 KB limit.", 413);

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return fail("A test writer token is required.", 401);

  let raw;
  try {
    raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail("Request exceeds the 250 KB limit.", 413);
  } catch {
    return fail("Could not read request body.", 400);
  }

  let body;
  try { body = JSON.parse(raw); } catch { return fail("Request body must be valid JSON.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Request body must be a JSON object.", 400);

  let app;
  try { app = getTestAdminApp(); } catch (error) {
    return fail(error instanceof Error ? error.message : "Test writer configuration error.", 503);
  }
  const auth = requireTestWriterToken(request);
  if (auth.error) return auth.error;

  const validation = validateImportBatch(body.products);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, mode: "rejected", errors: validation.errors }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (validation.products.length > MAX_PRODUCTS) return fail("Import is limited to 100 products.", 400);

  if (body.confirmWrite !== true) {
    return NextResponse.json({
      ok: true,
      mode: "dry-run",
      targetProject: TEST_PROJECT_ID,
      collection: "products",
      validated: true,
      count: validation.products.length,
      products: validation.products.map((product) => ({
        documentId: product.documentId,
        name: product.name,
        brand: product.brand,
        categorySlug: product.categorySlug,
        storeOffers: product.store.length,
      })),
      message: "No data was written. Set confirmWrite=true to create products in the test database.",
    }, { headers: { "Cache-Control": "no-store" } });
  }

  const db = getFirestore(app);
  const results = [];
  for (const product of validation.products) {
    try {
      const ref = db.collection("products").doc(product.documentId);
      const existing = await ref.get();
      if (existing.exists) {
        results.push({ documentId: product.documentId, name: product.name, status: "skipped", reason: "documentId already exists; never overwritten" });
        continue;
      }

      // Avoid an obvious duplicate under a different ID as well as duplicate IDs.
      // Query is intentionally simple to avoid requiring a composite Firestore index.
      const sameName = await db.collection("products").where("name", "==", product.name).limit(20).get();
      const sameIdentity = sameName.docs.some((doc) => {
        const saved = doc.data();
        return String(saved.brand || "").trim().toLocaleLowerCase("en") === product.brand.toLocaleLowerCase("en")
          && String(saved.categorySlug || "").trim().toLocaleLowerCase("en") === product.categorySlug.toLocaleLowerCase("en");
      });
      if (sameIdentity) {
        results.push({ documentId: product.documentId, name: product.name, status: "skipped", reason: "same name/brand/category already exists; review before importing" });
        continue;
      }

      const data = {
        name: product.name,
        brand: product.brand,
        categorySlug: product.categorySlug,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        tags: product.tags,
        impressions: 0,
        views: 0,
        store: product.store.map((offer) => ({
          name: offer.name.trim(),
          price: Number(offer.price),
          offer: offer.offer || "",
          url: offer.url,
        })),
        source: "csv-json-test-import",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await ref.create(data);
      let auditLogged = true;
      try {
        await db.collection("product_writer_audit").add({
          actorUid: auth.uid,
          operation: "bulk_create",
          collection: "products",
          documentId: ref.id,
          productName: data.name,
          sourceFormat: body.sourceFormat === "csv" ? "csv" : "json",
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch {
        auditLogged = false;
      }
      results.push({
        documentId: ref.id,
        name: data.name,
        status: "created",
        auditLogged,
        ...(auditLogged ? {} : { warning: "Created but audit logging failed. Do not retry blindly." }),
      });
    } catch (error) {
      const code = error && typeof error === "object" ? error.code : undefined;
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const duplicate = code === 6 || code === "already-exists" || message.includes("already exists");
      results.push({
        documentId: product.documentId,
        name: product.name,
        status: duplicate ? "skipped" : "failed",
        reason: duplicate ? "documentId already exists; never overwritten" : "write failed; verify test Firestore before retrying",
      });
    }
  }

  const created = results.filter((item) => item.status === "created").length;
  const skipped = results.filter((item) => item.status === "skipped").length;
  const failed = results.filter((item) => item.status === "failed").length;
  return NextResponse.json({
    ok: failed === 0,
    mode: "written",
    targetProject: TEST_PROJECT_ID,
    collection: "products",
    requested: validation.products.length,
    created,
    skipped,
    failed,
    results,
    message: failed ? "Some rows failed. Check each result and Firestore before retrying." : "Import completed. Skipped records were not overwritten.",
  }, { status: failed ? 207 : 200, headers: { "Cache-Control": "no-store" } });
}
