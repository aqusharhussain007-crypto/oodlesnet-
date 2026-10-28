import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCTION_PROJECT_ID = "oodlesnet-6c19e";
const MAX_BODY_BYTES = 50_000;

function fail(message, status) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function normalizePrivateKey(raw) {
  let key = String(raw || "").trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function getProductionAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (projectId !== PRODUCTION_PROJECT_ID) {
    throw new Error("Production writer is disabled: Firebase project configuration does not match the fixed production project.");
  }
  if (!clientEmail || !privateKey) throw new Error("Firebase Admin credentials are not configured.");
  const name = "oodlesnet-production-product-writer";
  return getApps().find((app) => app.name === name) ?? initializeApp({
    credential: cert({ projectId: PRODUCTION_PROJECT_ID, clientEmail, privateKey }),
    projectId: PRODUCTION_PROJECT_ID,
  }, name);
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) return "Product must be a JSON object.";
  if (typeof product.name !== "string" || product.name.trim().length < 2 || product.name.length > 180) return "name must be 2–180 characters.";
  if (typeof product.brand !== "string" || !product.brand.trim() || product.brand.length > 100) return "brand is required (max 100 characters).";
  if (typeof product.categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(product.categorySlug)) return "categorySlug must use lowercase letters, numbers, and hyphens.";
  if (product.description !== undefined && (typeof product.description !== "string" || product.description.length > 3000)) return "description must be text up to 3000 characters.";
  if (product.imageUrl !== undefined && product.imageUrl !== "" && !validHttpUrl(product.imageUrl)) return "imageUrl must be an HTTP(S) URL.";
  if (product.tags !== undefined && (!Array.isArray(product.tags) || product.tags.length > 30 || product.tags.some((tag) => typeof tag !== "string" || tag.length > 50))) return "tags must be an array of up to 30 short strings.";
  if (!Array.isArray(product.store) || product.store.length < 1 || product.store.length > 15) return "store must contain 1–15 offers.";
  for (const offer of product.store) {
    if (!offer || typeof offer !== "object" || typeof offer.name !== "string" || !offer.name.trim() || offer.name.length > 80) return "Each store offer needs a valid name.";
    const price = Number(offer.price);
    if (!Number.isFinite(price) || price <= 0 || price > 100000000) return "Each store offer needs a positive numeric price.";
    if (typeof offer.url !== "string" || !validHttpUrl(offer.url)) return "Each store offer needs a valid HTTP(S) URL.";
    if (offer.offer !== undefined && (typeof offer.offer !== "string" || offer.offer.length > 500)) return "offer must be text up to 500 characters.";
  }
  return null;
}

async function requireAdmin(request, app) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return { error: fail("A Firebase ID token is required.", 401) };
  const allowlist = (process.env.PRODUCTION_PRODUCT_WRITER_ADMIN_UIDS || "").split(",").map((uid) => uid.trim()).filter(Boolean);
  if (allowlist.length === 0) return { error: fail("Production writer admin allowlist is not configured.", 503) };
  let decoded;
  try {
    decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
  } catch {
    return { error: fail("Firebase ID token is invalid or expired.", 401) };
  }
  if (!allowlist.includes(decoded.uid)) return { error: fail("Administrator access is required.", 403) };
  return { uid: decoded.uid };
}

export async function GET() {
  const projectConfigured = process.env.FIREBASE_PROJECT_ID === PRODUCTION_PROJECT_ID;
  const credentialsConfigured = Boolean(
    process.env.FIREBASE_CLIENT_EMAIL && normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
  );
  const adminAllowlistConfigured = Boolean(
    (process.env.PRODUCTION_PRODUCT_WRITER_ADMIN_UIDS || "").split(",").some((uid) => uid.trim())
  );

  return NextResponse.json({
    ok: true,
    service: "oodlesnet-production-product-writer",
    projectLocked: PRODUCTION_PROJECT_ID,
    mode: "dry-run by default",
    configurationReady: projectConfigured && credentialsConfigured && adminAllowlistConfigured,
    maxBodyBytes: MAX_BODY_BYTES,
    writeRequirements: ["valid Firebase ID token", "UID in server-side admin allowlist", "confirmWrite=true"],
    message: "Status only; POST requires verified admin authentication. Without confirmWrite=true, POST performs no write.",
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return fail("Request exceeds the 50 KB limit.", 413);
  // Reject anonymous requests before parsing the request body or checking server configuration.
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return fail("A Firebase ID token is required.", 401);
  let body;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail("Request exceeds the 50 KB limit.", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Request body must be a JSON object.", 400);
  let app;
  try {
    app = getProductionAdminApp();
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Production writer configuration error.", 503);
  }
  const auth = await requireAdmin(request, app);
  if (auth.error) return auth.error;

  const validationError = validateProduct(body.product);
  if (validationError) return fail(validationError, 400);

  const product = body.product;
  const data = {
    name: product.name.trim(),
    brand: product.brand.trim(),
    categorySlug: product.categorySlug,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    tags: Array.isArray(product.tags) ? product.tags : [],
    impressions: 0,
    views: 0,
    store: product.store.map((offer) => ({
      name: offer.name.trim(),
      price: Number(offer.price),
      offer: offer.offer || "",
      url: offer.url,
    })),
    source: "admin-product-writer",
  };

  const documentId = body.documentId;
  if (documentId !== undefined && (typeof documentId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(documentId))) {
    return fail("documentId may contain only letters, numbers, underscores, and hyphens (max 100).", 400);
  }

  if (body.confirmWrite !== true) {
    return NextResponse.json({
      ok: true, mode: "dry-run", targetProject: PRODUCTION_PROJECT_ID,
      collection: "products", validated: true,
      product: { name: data.name, brand: data.brand, categorySlug: data.categorySlug, storeOffers: data.store.length },
      message: "No data was written. Set confirmWrite=true to create the product.",
    }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const db = getFirestore(app);
    const ref = documentId ? db.collection("products").doc(documentId) : db.collection("products").doc();
    await ref.create({ ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    let auditLogged = true;
    try {
      await db.collection("product_writer_audit").add({
        actorUid: auth.uid,
        operation: "create",
        collection: "products",
        documentId: ref.id,
        productName: data.name,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch {
      auditLogged = false;
    }
    return NextResponse.json({
      ok: true, mode: "written", targetProject: PRODUCTION_PROJECT_ID,
      collection: "products", documentId: ref.id, productName: data.name,
      auditLogged,
      warning: auditLogged ? undefined : "Product was created, but audit logging failed. Do not retry; verify the product in Firestore.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error && typeof error === "object" ? error.code : undefined;
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (code === 6 || code === "already-exists" || message.includes("already exists")) {
      return fail("That document ID already exists. Existing products are never overwritten.", 409);
    }
    return fail("Product creation failed. Verify configuration and database availability before retrying.", 500);
  }
}


// Narrow repair operation: update only the known OnePlus document's image, category, and fixed comparison offers.
export async function PATCH(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return fail("A Firebase ID token is required.", 401);

  let body;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 5_000) return fail("Request exceeds the 5 KB limit.", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  const expectedDocumentId = "oneplus-nord-ce5-5g-live-20261028";
  if (!body || body.documentId !== expectedDocumentId || body.confirmUpdate !== true) {
    return fail("This repair is restricted to the fixed OnePlus document and requires confirmUpdate=true.", 400);
  }
  if (body.categorySlug !== "smartphones") return fail("Only the approved smartphones category is allowed for this repair.", 400);
  if (typeof body.imageUrl !== "string" || body.imageUrl.length > 2000 || !validHttpUrl(body.imageUrl)) {
    return fail("A valid HTTP(S) image URL is required.", 400);
  }

  let app;
  try {
    app = getProductionAdminApp();
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Production writer configuration error.", 503);
  }
  const auth = await requireAdmin(request, app);
  if (auth.error) return auth.error;

  try {
    const db = getFirestore(app);
    const ref = db.collection("products").doc(expectedDocumentId);
    const existing = await ref.get();
    if (!existing.exists) return fail("The fixed product document was not found; nothing was changed.", 404);
    const existingName = existing.get("name");
    if (existingName !== "OnePlus Nord CE5 5G") {
      return fail("The fixed document does not match the expected product; nothing was changed.", 409);
    }

    // Server-controlled comparison offers: never accept arbitrary store URLs/prices from the browser.
    const comparisonStores = [
      {
        name: "OnePlus India",
        price: 24999,
        offer: "Official starting price; verify the selected variant and final checkout price.",
        url: "https://www.oneplus.in/nord-ce5",
      },
      {
        name: "Flipkart",
        price: 22500,
        offer: "Observed on the retailer listing on 28 Oct 2026 for 8GB/128GB; seller availability and final price may change.",
        url: "https://www.flipkart.com/oneplus-nord-ce5-5g-nexus-blue-256-gb/p/itm9259708fe4e3c",
      },
      {
        name: "Croma",
        price: 24999,
        offer: "Last observed at ₹24,999 on 26 Sep 2026 for 8GB/128GB Marble Mist; recheck the current checkout price.",
        url: "https://www.croma.com/oneplus-nord-ce5-5g-8gb-ram-128gb-marble-mist-/p/316555",
      },
    ];

    await ref.update({
      imageUrl: body.imageUrl,
      categorySlug: "smartphones",
      store: comparisonStores,
      updatedAt: FieldValue.serverTimestamp(),
    });

    let auditLogged = true;
    try {
      await db.collection("product_writer_audit").add({
        actorUid: auth.uid,
        operation: "repair-image-category-and-store-comparison",
        collection: "products",
        documentId: expectedDocumentId,
        productName: existingName,
        categorySlug: "smartphones",
        storeNames: comparisonStores.map((offer) => offer.name),
        imageHost: new URL(body.imageUrl).hostname,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch {
      auditLogged = false;
    }

    return NextResponse.json({
      ok: true,
      mode: "updated",
      targetProject: PRODUCTION_PROJECT_ID,
      collection: "products",
      documentId: expectedDocumentId,
      productName: existingName,
      categorySlug: "smartphones",
      imageUrlUpdated: true,
      storeCount: 3,
      stores: ["OnePlus India", "Flipkart", "Croma"],
      auditLogged,
      warning: auditLogged ? undefined : "Product was updated, but audit logging failed. Do not retry blindly.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("The product repair failed. Verify Firestore before trying again.", 500);
  }
}


export async function DELETE(request) {
 const authorization=request.headers.get('authorization')||'';
 if(!authorization.startsWith('Bearer ')) return fail('A Firebase ID token is required.',401);
 let body; try { const raw=await request.text(); if(Buffer.byteLength(raw,'utf8')>2000)return fail('Request too large.',413); body=JSON.parse(raw); } catch { return fail('Invalid JSON.',400); }
 if(!body||body.confirmDelete!==true||body.categorySlug!=='mobile') return fail('Explicit mobile category deletion confirmation required.',400);
 let app; try { app=getProductionAdminApp(); } catch(error) { return fail(error instanceof Error?error.message:'Configuration error.',503); }
 const auth=await requireAdmin(request,app); if(auth.error)return auth.error;
 try { const db=getFirestore(app); const remaining=await db.collection('products').where('categorySlug','==','mobile').limit(1).get(); if(!remaining.empty)return fail('Products still use mobile; nothing deleted.',409);
 const categories=await db.collection('categories').where('slug','==','mobile').get(); if(categories.empty)return NextResponse.json({ok:true,mode:'already-absent',deletedCount:0,categorySlug:'mobile'},{headers:{'Cache-Control':'no-store'}});
 const batch=db.batch(); categories.docs.forEach(doc=>batch.delete(doc.ref)); await batch.commit();
 let auditLogged=true; try { await db.collection('product_writer_audit').add({actorUid:auth.uid,operation:'delete-empty-category',collection:'categories',categorySlug:'mobile',deletedDocumentIds:categories.docs.map(doc=>doc.id),createdAt:FieldValue.serverTimestamp()}); } catch { auditLogged=false; }
 return NextResponse.json({ok:true,mode:'deleted',targetProject:PRODUCTION_PROJECT_ID,categorySlug:'mobile',deletedCount:categories.size,auditLogged},{headers:{'Cache-Control':'no-store'}});
 } catch { return fail('Category deletion failed. Verify Firestore before retrying.',500); }
}
