import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEST_PROJECT_ID = "oodlesnet-test";
const MAX_BODY_BYTES = 20_000;
const ALLOWED_PRODUCTS = Object.freeze({
  "36MaFYdnIalGYYwZhZbq": { brand: "Motorola", nameIncludes: "Edge 70" },
  "wYJ88jdBndp0VqtyE0Tu": { brand: "Nothing Phone", nameIncludes: "Phone (2a)" },
});
const ALLOWED_SPEC_KEYS = new Set([
  "display", "processor", "ram", "storage", "rearCamera", "frontCamera",
  "battery", "charging", "operatingSystem", "network",
]);

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
    throw new Error("Spec updater is locked to the isolated oodlesnet-test Firebase project.");
  }
  if (!clientEmail || !privateKey) throw new Error("Test Firebase Admin credentials are not configured.");

  const name = "oodlesnet-restricted-spec-updater";
  return getApps().find((app) => app.name === name) ?? initializeApp({
    credential: cert({ projectId: TEST_PROJECT_ID, clientEmail, privateKey }),
    projectId: TEST_PROJECT_ID,
  }, name);
}

async function requireAdmin(request, app) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return { error: fail("A Firebase ID token is required.", 401) };

  const allowlist = (process.env.TEST_WRITER_ADMIN_UIDS || "")
    .split(",").map((uid) => uid.trim()).filter(Boolean);
  if (!allowlist.length) return { error: fail("Test writer admin allowlist is not configured.", 503) };

  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(decoded.uid)) return { error: fail("Administrator access is required.", 403) };
    return { uid: decoded.uid };
  } catch {
    return { error: fail("Firebase ID token is invalid or expired.", 401) };
  }
}

function validateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be a JSON object.";
  if (typeof body.documentId !== "string" || !Object.hasOwn(ALLOWED_PRODUCTS, body.documentId)) {
    return "Only the two pre-approved test product IDs can be updated.";
  }
  if (!body.specs || typeof body.specs !== "object" || Array.isArray(body.specs)) {
    return "specs must be an object.";
  }
  const keys = Object.keys(body.specs);
  if (!keys.length) return "At least one specification is required.";
  const unknown = keys.filter((key) => !ALLOWED_SPEC_KEYS.has(key));
  if (unknown.length) return "Unsupported specification field: " + unknown.join(", ");
  for (const [key, value] of Object.entries(body.specs)) {
    if (typeof value !== "string" || !value.trim() || value.length > 500) {
      return key + " must be non-empty text up to 500 characters.";
    }
  }
  if (body.confirmWrite !== undefined && typeof body.confirmWrite !== "boolean") {
    return "confirmWrite must be a boolean.";
  }
  return null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "oodlesnet-restricted-test-spec-updater",
    projectLocked: TEST_PROJECT_ID,
    mode: "dry-run by default",
    allowedDocumentIds: Object.keys(ALLOWED_PRODUCTS),
    allowedSpecFields: [...ALLOWED_SPEC_KEYS],
    writeRequirements: [
      "valid Firebase ID token",
      "UID in TEST_WRITER_ADMIN_UIDS",
      "one of the two allowlisted document IDs",
      "confirmWrite=true",
    ],
    behavior: "Updates only the specs map. Existing values are backed up transactionally before changes.",
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return fail("Request exceeds the 20 KB limit.", 413);

  let raw;
  try {
    raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail("Request exceeds the 20 KB limit.", 413);
  } catch {
    return fail("Could not read request body.", 400);
  }

  let body;
  try { body = JSON.parse(raw); } catch { return fail("Request body must be valid JSON.", 400); }
  const validationError = validateRequest(body);
  if (validationError) return fail(validationError, 400);

  let app;
  try { app = getTestAdminApp(); } catch (error) {
    return fail(error instanceof Error ? error.message : "Test writer configuration error.", 503);
  }

  const auth = await requireAdmin(request, app);
  if (auth.error) return auth.error;

  const expected = ALLOWED_PRODUCTS[body.documentId];
  const db = getFirestore(app);
  const productRef = db.collection("products").doc(body.documentId);

  try {
    if (body.confirmWrite !== true) {
      const snapshot = await productRef.get();
      if (!snapshot.exists) return fail("The allowlisted product does not exist in the test database.", 404);
      const product = snapshot.data();
      if (String(product.brand || "").trim().toLowerCase() !== expected.brand.toLowerCase()
        || !String(product.name || "").toLowerCase().includes(expected.nameIncludes.toLowerCase())) {
        return fail("Product identity does not match the allowlist. No changes were made.", 409);
      }
      return NextResponse.json({
        ok: true,
        mode: "dry-run",
        targetProject: TEST_PROJECT_ID,
        collection: "products",
        documentId: body.documentId,
        productName: product.name,
        existingSpecKeys: Object.keys(product.specs || {}),
        proposedSpecKeys: Object.keys(body.specs),
        message: "Validated only. No data was written. Set confirmWrite=true to apply this restricted update.",
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(productRef);
      if (!snapshot.exists) throw new Error("PRODUCT_NOT_FOUND");
      const product = snapshot.data();

      if (String(product.brand || "").trim().toLowerCase() !== expected.brand.toLowerCase()
        || !String(product.name || "").toLowerCase().includes(expected.nameIncludes.toLowerCase())) {
        throw new Error("PRODUCT_IDENTITY_MISMATCH");
      }

      const oldSpecs = product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
        ? product.specs
        : {};
      const mergedSpecs = { ...oldSpecs, ...body.specs };
      const backupRef = db.collection("product_spec_update_backups").doc();
      transaction.create(backupRef, {
        productDocumentId: body.documentId,
        productName: product.name || null,
        brand: product.brand || null,
        previousSpecs: oldSpecs,
        proposedSpecs: body.specs,
        resultingSpecs: mergedSpecs,
        actorUid: auth.uid,
        createdAt: FieldValue.serverTimestamp(),
        source: "restricted-test-spec-updater",
      });
      transaction.update(productRef, {
        specs: mergedSpecs,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { backupId: backupRef.id, productName: product.name, resultingSpecKeys: Object.keys(mergedSpecs) };
    });

    return NextResponse.json({
      ok: true,
      mode: "written",
      targetProject: TEST_PROJECT_ID,
      collection: "products",
      documentId: body.documentId,
      ...result,
      message: "Specifications updated in the isolated test database. Previous specs were backed up in the same transaction.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "PRODUCT_NOT_FOUND") return fail("The allowlisted product does not exist in the test database.", 404);
    if (code === "PRODUCT_IDENTITY_MISMATCH") return fail("Product identity does not match the allowlist. No changes were made.", 409);
    return fail("Test specification update failed. Check the test database before retrying.", 500);
  }
}
