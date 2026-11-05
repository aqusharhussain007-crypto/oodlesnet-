import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PROJECT_ID = "oodlesnet-6c19e";
const COLLECTIONS = new Set(["products", "categories"]);

function response(body, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function getApp() {
  if (process.env.FIREBASE_PROJECT_ID !== PROJECT_ID) throw new Error("Production Firebase project mismatch.");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Firebase Admin credentials are not configured.");
  const name = "oodlesnet-firestore-audit";
  return getApps().find(app => app.name === name) || initializeApp({
    credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }), projectId: PROJECT_ID
  }, name);
}
async function requireAdmin(request, app) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return { error: response({ ok: false, error: "Firebase ID token required." }, 401) };
  const allowlist = (process.env.PRODUCTION_PRODUCT_WRITER_ADMIN_UIDS || "").split(",").map(x => x.trim()).filter(Boolean);
  if (!allowlist.length) return { error: response({ ok: false, error: "Admin UID allowlist is not configured." }, 503) };
  try {
    const user = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(user.uid)) return { error: response({ ok: false, error: "Admin access required." }, 403) };
    return { uid: user.uid };
  } catch {
    return { error: response({ ok: false, error: "Invalid or expired Firebase ID token." }, 401) };
  }
}
function serialize(value) {
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, serialize(v)]));
  return value;
}
export async function GET(request) {
  let app;
  try { app = getApp(); } catch (error) { return response({ ok: false, error: error.message }, 503); }
  const auth = await requireAdmin(request, app);
  if (auth.error) return auth.error;
  const params = new URL(request.url).searchParams;
  const collection = params.get("collection") || "";
  const cursor = params.get("cursor") || "";
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") || 50)));
  if (!COLLECTIONS.has(collection)) return response({ ok: false, error: "Only products and categories can be read." }, 400);
  if (cursor && !/^[A-Za-z0-9_-]{1,100}$/.test(cursor)) return response({ ok: false, error: "Invalid cursor." }, 400);
  try {
    const db = getFirestore(app);
    let query = db.collection(collection).orderBy(FieldPath.documentId()).limit(limit + 1);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    const more = snapshot.docs.length > limit;
    const documents = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, data: serialize(doc.data()) }));
    return response({ ok: true, project: PROJECT_ID, collection, count: documents.length, hasMore: more, nextCursor: more ? documents[documents.length - 1].id : null, documents });
  } catch {
    return response({ ok: false, error: "Firestore read failed." }, 500);
  }
}


function validHttpUrl(value) {
  try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; }
  catch { return false; }
}
function validateProduct(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return "Product must be an object.";
  if (typeof p.name !== "string" || p.name.trim().length < 2 || p.name.length > 180) return "name must be 2–180 characters.";
  if (typeof p.brand !== "string" || !p.brand.trim() || p.brand.length > 100) return "brand is required (max 100 characters).";
  if (typeof p.categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(p.categorySlug)) return "categorySlug is invalid.";
  if (p.description !== undefined && (typeof p.description !== "string" || p.description.length > 3000)) return "description is invalid.";
  if (p.imageUrl !== undefined && p.imageUrl !== "" && !validHttpUrl(p.imageUrl)) return "imageUrl must be HTTP(S).";
  if (p.tags !== undefined && (!Array.isArray(p.tags) || p.tags.length > 30 || p.tags.some(x => typeof x !== "string" || x.length > 50))) return "tags are invalid.";
  if (!Array.isArray(p.store) || p.store.length < 1 || p.store.length > 15) return "store must contain 1–15 offers.";
  for (const offer of p.store) {
    if (!offer || typeof offer.name !== "string" || !offer.name.trim() || offer.name.length > 80) return "Store offer name is invalid.";
    if (!Number.isFinite(Number(offer.price)) || Number(offer.price) <= 0 || Number(offer.price) > 100000000) return "Store offer price must be positive.";
    if (typeof offer.url !== "string" || !validHttpUrl(offer.url)) return "Store offer URL must be HTTP(S).";
    if (offer.offer !== undefined && (typeof offer.offer !== "string" || offer.offer.length > 500)) return "Store offer text is invalid.";
  }
  return null;
}
function validateCategory(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) return "Category must be an object.";
  if (typeof c.slug !== "string" || !/^[a-z0-9-]{1,80}$/.test(c.slug)) return "slug is invalid.";
  if (typeof c.name !== "string" || !c.name.trim() || c.name.length > 100) return "name is required.";
  if (c.icon !== undefined && (typeof c.icon !== "string" || c.icon.length > 30)) return "icon is invalid.";
  if (c.order !== undefined && (!Number.isFinite(Number(c.order)) || Number(c.order) < 0)) return "order must be non-negative.";
  return null;
}
function validDocumentId(id) { return typeof id === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(id); }


async function handleBatchUpdate(body, db, uid) {
  if (body.collection !== "products") return response({ ok: false, error: "Bulk update is currently limited to products." }, 400);
  if (!Array.isArray(body.records) || body.records.length < 1 || body.records.length > 100) {
    return response({ ok: false, error: "records must contain 1–100 products." }, 400);
  }
  const seen = new Set();
  const prepared = [];
  for (let index = 0; index < body.records.length; index++) {
    const item = body.records[index];
    if (!item || typeof item !== "object" || Array.isArray(item) || !validDocumentId(item.id)) {
      return response({ ok: false, error: "Record " + (index + 1) + " must include its exact Firestore document ID." }, 400);
    }
    if (seen.has(item.id)) return response({ ok: false, error: "Duplicate document ID: " + item.id }, 400);
    seen.add(item.id);
    if (!item.data || typeof item.data !== "object" || Array.isArray(item.data)) {
      return response({ ok: false, error: "Record " + (index + 1) + " data must be an object." }, 400);
    }
    const ref = db.collection("products").doc(item.id);
    prepared.push({ id: item.id, ref, data: item.data });
  }

  try {
    const refs = prepared.map(item => item.ref);
    const snapshots = await db.getAll(...refs);
    const checked = [];
    for (let index = 0; index < prepared.length; index++) {
      const item = prepared[index];
      const snap = snapshots[index];
      if (!snap.exists) return response({ ok: false, error: "Product not found: " + item.id + ". No products were changed." }, 404);
      const existing = snap.data();
      const protectedFields = ["impressions", "views", "source", "createdAt"];
      const updateData = Object.fromEntries(Object.entries(item.data).filter(([key]) => !protectedFields.includes(key)));
      if (!Object.keys(updateData).length) return response({ ok: false, error: "No editable fields in product " + item.id + "." }, 400);
      const merged = { ...existing, ...updateData };
      const validationError = validateProduct(merged);
      if (validationError) return response({ ok: false, error: "Product " + item.id + ": " + validationError }, 400);
      checked.push({
        id: item.id, ref: item.ref, existing, updateData,
        changedFields: [...Object.keys(updateData), ...(Object.prototype.hasOwnProperty.call(existing, "categorySlug ") ? ["categorySlug (legacy field removal)"] : [])]
      });
    }

    if (body.confirm !== true) {
      return response({
        ok: true, mode: "dry-run", project: PROJECT_ID, collection: "products",
        count: checked.length, valid: checked.length, invalid: 0,
        products: checked.map(item => ({ documentId: item.id, name: item.updateData.name || item.existing.name || "", changedFields: item.changedFields })),
        message: "All products passed validation. No database changes were made. Review the complete list, then confirm the batch."
      });
    }

    await db.runTransaction(async transaction => {
      const fresh = await transaction.getAll(...refs);
      for (let index = 0; index < checked.length; index++) {
        if (!fresh[index].exists) throw new Error("BATCH_MISSING:" + checked[index].id);
        const current = fresh[index].data();
        const updateData = checked[index].updateData;
        const merged = { ...current, ...updateData };
        const validationError = validateProduct(merged);
        if (validationError) throw new Error("BATCH_INVALID:" + checked[index].id + ":" + validationError);
      }
      for (let index = 0; index < checked.length; index++) {
        const item = checked[index];
        const current = fresh[index].data();
        const backupRef = db.collection("firestore_admin_backups").doc();
        const auditRef = db.collection("product_writer_audit").doc();
        transaction.create(backupRef, {
          collection: "products", documentId: item.id, operation: "update-backup",
          originalData: current, actorUid: uid, createdAt: new Date()
        });
        transaction.update(item.ref, {
          ...item.updateData,
          ...(Object.prototype.hasOwnProperty.call(current, "categorySlug ") ? { "categorySlug ": FieldValue.delete() } : {}),
          ...(Object.prototype.hasOwnProperty.call(current, "impression") && !Object.prototype.hasOwnProperty.call(current, "impressions") ? { impressions: Number(current.impression) || 0, impression: FieldValue.delete() } : {}),
          updatedAt: new Date()
        });
        transaction.create(auditRef, {
          actorUid: uid, operation: "update", collection: "products", documentId: item.id,
          backupId: backupRef.id, changedFields: Object.keys(item.updateData), batchSize: checked.length,
          createdAt: new Date()
        });
      }
    });
    return response({
      ok: true, mode: "batch-updated", project: PROJECT_ID, collection: "products",
      count: checked.length, backupAndAuditPerProduct: true,
      documentIds: checked.map(item => item.id)
    });
  } catch (error) {
    if (String(error?.message || "").startsWith("BATCH_MISSING:")) return response({ ok: false, error: "A product disappeared during confirmation (" + error.message.split(":")[1] + "). No batch writes were committed." }, 409);
    if (String(error?.message || "").startsWith("BATCH_INVALID:")) return response({ ok: false, error: "A product changed and no longer passes validation: " + error.message.slice("BATCH_INVALID:".length) }, 409);
    return response({ ok: false, error: "Batch operation failed. Verify Firestore before retrying; transaction changes are atomic." }, 500);
  }
}

export async function POST(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 250000) return response({ ok: false, error: "Request exceeds 250 KB." }, 413);
  let body;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 250000) return response({ ok: false, error: "Request exceeds 250 KB." }, 413);
    body = JSON.parse(raw);
  } catch { return response({ ok: false, error: "Valid JSON is required." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return response({ ok: false, error: "JSON object required." }, 400);

  let app;
  try { app = getApp(); } catch (error) { return response({ ok: false, error: error.message }, 503); }
  const auth = await requireAdmin(request, app);
  if (auth.error) return auth.error;

  const { operation, collection, documentId, data } = body;
  const db = getFirestore(app);
  if (operation === "batch-update") return handleBatchUpdate(body, db, auth.uid);
  if (!COLLECTIONS.has(collection)) return response({ ok: false, error: "Only products and categories are permitted." }, 400);
  if (!["create", "update", "delete"].includes(operation)) return response({ ok: false, error: "operation must be create, update, or delete." }, 400);
  if (operation !== "create" && !validDocumentId(documentId)) return response({ ok: false, error: "Valid documentId required." }, 400);
  if (operation === "create" && documentId !== undefined && !validDocumentId(documentId)) return response({ ok: false, error: "Invalid documentId." }, 400);

  const ref = documentId ? db.collection(collection).doc(documentId) : db.collection(collection).doc();
  let existing = null;
  if (operation !== "create") {
    try {
      const snap = await ref.get();
      if (!snap.exists) return response({ ok: false, error: "Document not found; nothing changed." }, 404);
      existing = snap.data();
    } catch { return response({ ok: false, error: "Could not read target document." }, 500); }
  }

  if (operation === "create") {
    const error = collection === "products" ? validateProduct(data) : validateCategory(data);
    if (error) return response({ ok: false, error }, 400);
  } else if (operation === "update") {
    if (!data || typeof data !== "object" || Array.isArray(data) || !Object.keys(data).length) return response({ ok: false, error: "Non-empty update data required." }, 400);
    // Full-record edits may include protected fields copied from the read view.
    // Ignore those submitted values and leave the existing Firestore values untouched.
    const protectedFields = collection === "products" ? ["impressions", "views", "source", "createdAt"] : [];
    const updateData = Object.fromEntries(Object.entries(data).filter(([key]) => !protectedFields.includes(key)));
    if (!Object.keys(updateData).length) return response({ ok: false, error: "No editable fields were supplied." }, 400);
    const merged = { ...existing, ...updateData };
    const error = collection === "products" ? validateProduct(merged) : validateCategory(merged);
    if (error) return response({ ok: false, error }, 400);
    body.safeUpdateData = updateData;
  } else {
    if (body.confirmDelete !== true) return response({ ok: false, error: "confirmDelete=true is required for deletion." }, 400);
    if (collection === "categories") {
      const slug = existing.slug || documentId;
      const products = await db.collection("products").where("categorySlug", "==", slug).limit(1).get();
      if (!products.empty) return response({ ok: false, error: "Category is still used by products; move those products first." }, 409);
    }
  }

  if (body.confirm !== true) return response({
    ok: true, mode: "dry-run", project: PROJECT_ID, collection, operation,
    documentId: ref.id, existingDocument: operation !== "create",
    changedFields: operation === "delete" ? Object.keys(existing || {}) : [...Object.keys(body.safeUpdateData || data || {}), ...(collection === "products" && Object.prototype.hasOwnProperty.call(existing || {}, "categorySlug ") ? ["categorySlug (legacy field removal)"] : [])],
    message: "No database changes were made. Review this preview, then repeat with confirm=true."
  });

  const batch = db.batch();
  const backupRef = operation === "create" ? null : db.collection("firestore_admin_backups").doc();
  const auditRef = db.collection("product_writer_audit").doc();
  if (operation !== "create") batch.create(backupRef, {
    collection, documentId: ref.id, operation: operation + "-backup",
    originalData: existing, actorUid: auth.uid, createdAt: new Date()
  });
  if (operation === "create") {
    const createData = collection === "products"
      ? { ...data, impressions: 0, views: 0, source: "admin-firestore-manager", createdAt: new Date(), updatedAt: new Date() }
      : { ...data, createdAt: new Date(), updatedAt: new Date() };
    batch.create(ref, createData);
  } else if (operation === "update") {
    batch.update(ref, {
      ...(body.safeUpdateData || data),
      ...(collection === "products" && Object.prototype.hasOwnProperty.call(existing || {}, "categorySlug ") ? { "categorySlug ": FieldValue.delete() } : {}),
      ...(collection === "products" && Object.prototype.hasOwnProperty.call(existing || {}, "impression") && !Object.prototype.hasOwnProperty.call(existing || {}, "impressions") ? { impressions: Number(existing.impression) || 0, impression: FieldValue.delete() } : {}),
      updatedAt: new Date()
    });
  } else {
    batch.delete(ref);
  }
  batch.create(auditRef, {
    actorUid: auth.uid, operation, collection, documentId: ref.id,
    backupId: backupRef ? backupRef.id : null,
    changedFields: operation === "delete" ? Object.keys(existing || {}) : Object.keys(data || {}),
    createdAt: new Date()
  });
  try {
    await batch.commit();
    return response({
      ok: true, mode: operation === "create" ? "created" : operation === "update" ? "updated" : "deleted",
      project: PROJECT_ID, collection, documentId: ref.id,
      backupId: backupRef ? backupRef.id : null, auditLogged: true
    });
  } catch (error) {
    if (error?.code === 6 || error?.code === "already-exists") return response({ ok: false, error: "Document already exists; no changes were made." }, 409);
    return response({ ok: false, error: "Firestore operation failed. Verify the document before retrying." }, 500);
  }
}
