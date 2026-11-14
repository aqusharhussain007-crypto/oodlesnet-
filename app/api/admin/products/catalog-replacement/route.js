import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PROJECT = "oodlesnet-test";
const EXPECTED_COUNT = 66;
const MAX_BYTES = 180_000;

function fail(message, status) {
  return NextResponse.json({ ok: false, error: message }, {
    status, headers: { "Cache-Control": "no-store" },
  });
}
function getApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (projectId !== PROJECT) throw new Error("Catalogue replacement is locked to oodlesnet-test.");
  if (!clientEmail || !privateKey) throw new Error("Test Firebase Admin credentials are not configured.");
  return getApps().find((app) => app.name === "oodlesnet-test-catalog-replacement") ??
    initializeApp({ credential: cert({ projectId: PROJECT, clientEmail, privateKey }), projectId: PROJECT }, "oodlesnet-test-catalog-replacement");
}
function validUrl(value) {
  if (value === undefined || value === null || value === "") return true;
  try { const u = new URL(value); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}
function validateProducts(products) {
  if (!Array.isArray(products) || products.length !== EXPECTED_COUNT) return "The import must contain exactly 66 products.";
  const ids = new Set();
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const prefix = "Product " + (i + 1) + ": ";
    if (!item || typeof item !== "object" || Array.isArray(item) || typeof item.id !== "string" ||
      !/^[A-Za-z0-9_-]{1,120}$/.test(item.id)) return prefix + "invalid document ID.";
    if (ids.has(item.id)) return prefix + "duplicate document ID.";
    ids.add(item.id);
    const d = item.data;
    if (!d || typeof d !== "object" || Array.isArray(d)) return prefix + "data must be an object.";
    if (typeof d.name !== "string" || !d.name.trim() || d.name.length > 180) return prefix + "invalid product name.";
    if (typeof d.brand !== "string" || !d.brand.trim() || d.brand.length > 100) return prefix + "invalid brand.";
    if (typeof d.categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(d.categorySlug)) return prefix + "invalid category slug.";
    if (!Array.isArray(d.store) || d.store.length < 1 || d.store.length > 15) return prefix + "invalid store offers.";
    for (const offer of d.store) {
      if (!offer || typeof offer !== "object" || typeof offer.name !== "string" || !offer.name.trim()) return prefix + "store name missing.";
      if (offer.price !== null && offer.price !== undefined && (!Number.isFinite(Number(offer.price)) || Number(offer.price) <= 0)) return prefix + "invalid offer price.";
      if (!validUrl(offer.url)) return prefix + "invalid store URL.";
    }
  }
  return null;
}
export async function GET() {
  return NextResponse.json({ ok: true, service: "test-catalogue-replacement", projectLocked: PROJECT, expectedProducts: EXPECTED_COUNT, mode: "explicitly confirmed replacement with full backup" });
}
export async function POST(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BYTES) return fail("Upload exceeds 180 KB.", 413);
  let body, raw;
  try {
    raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) return fail("Upload exceeds 180 KB.", 413);
    body = JSON.parse(raw);
  } catch { return fail("Request must contain valid JSON.", 400); }
  if (body?.confirmReplace !== true) return fail("Explicit confirmReplace=true is required.", 400);
  const error = validateProducts(body.products);
  if (error) return fail(error, 400);

  let app;
  try { app = getApp(); } catch (e) { return fail(e instanceof Error ? e.message : "Test configuration error.", 503); }
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return fail("Firebase ID token required.", 401);
  const allowlist = (process.env.TEST_WRITER_ADMIN_UIDS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!allowlist.length) return fail("Test admin allowlist is not configured.", 503);
  let uid;
  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(decoded.uid)) return fail("Administrator access required.", 403);
    uid = decoded.uid;
  } catch { return fail("Firebase ID token is invalid or expired.", 401); }

  const db = getFirestore(app);
  try {
    const snapshot = await db.collection("products").get();
    const oldDocs = snapshot.docs;
    const ids = body.products.map((p) => p.id);
    const idSet = new Set(ids);
    const digest = createHash("sha256").update(JSON.stringify(body.products)).digest("hex");
    const batchId = "catalog66-" + digest.slice(0, 24);
    const batch = db.batch();
    const backupManifest = db.collection("catalog_replacement_backups").doc(batchId);
    batch.create(backupManifest, {
      project: PROJECT, collection: "products", requestedProductCount: EXPECTED_COUNT,
      previousProductCount: oldDocs.length, targetDocumentIds: ids,
      actorUid: uid, payloadSha256: digest, createdAt: FieldValue.serverTimestamp(),
    });
    for (const doc of oldDocs) {
      const backupRef = db.collection("catalog_replacement_backups").doc(batchId + "-" + createHash("sha1").update(doc.id).digest("hex").slice(0, 24));
      batch.create(backupRef, {
        batchId, originalDocumentId: doc.id, originalData: doc.data(),
        backedUpAt: FieldValue.serverTimestamp(), actorUid: uid,
      });
    }
    for (const item of body.products) {
      const ref = db.collection("products").doc(item.id);
      batch.set(ref, { ...item.data, updatedAt: FieldValue.serverTimestamp() });
    }
    let deleted = 0;
    for (const doc of oldDocs) {
      if (!idSet.has(doc.id)) { batch.delete(doc.ref); deleted++; }
    }
    await batch.commit();
    return NextResponse.json({
      ok: true, mode: "replaced", targetProject: PROJECT, collection: "products",
      imported: EXPECTED_COUNT, backedUp: oldDocs.length, removedNotInTarget: deleted,
      retainedOrReplacedIds: oldDocs.filter((d) => idSet.has(d.id)).map((d) => d.id),
      backupBatchId: batchId, payloadSha256: digest,
      message: "Catalogue replacement committed. Every previous product document was backed up before replacement/deletion in the same Firestore batch.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return fail("Catalogue replacement failed. No success is claimed; inspect the test database and backup collection before retrying.", 500);
  }
}
