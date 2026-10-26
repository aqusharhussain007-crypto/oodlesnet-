import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeTestWriterAudit } from "@/lib/test-writer-audit";
import { enforceTestWriterRateLimit } from "@/lib/test-writer-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function getDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Hard guard: this endpoint must never connect to production.
  if (projectId !== "oodlesnet-test") {
    throw new Error("Test writer is locked to the oodlesnet-test Firebase project.");
  }
  if (!clientEmail || !privateKey) {
    throw new Error("Test Firebase Admin credentials are not configured.");
  }

  const app =
    getApps().find((item) => item.name === "oodlesnet-test-writer") ??
    initializeApp(
      {
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      },
      "oodlesnet-test-writer",
    );

  return getFirestore(app);
}

function validateProduct(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const { name, brand, categorySlug, description, imageUrl, tags, store } = body;

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 180) {
    return "name is required (2–180 characters).";
  }
  if (typeof brand !== "string" || brand.trim().length < 1 || brand.length > 100) {
    return "brand is required (1–100 characters).";
  }
  if (typeof categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(categorySlug)) {
    return "categorySlug must contain lowercase letters, numbers, or hyphens.";
  }
  if (description !== undefined && (typeof description !== "string" || description.length > 3000)) {
    return "description must be text up to 3000 characters.";
  }
  if (imageUrl !== undefined && imageUrl !== "" && !isHttpUrl(imageUrl)) {
    return "imageUrl must be a valid HTTP(S) URL.";
  }
  if (tags !== undefined && (!Array.isArray(tags) || tags.length > 30 || tags.some((tag) => typeof tag !== "string" || tag.length > 50))) {
    return "tags must be an array of up to 30 short strings.";
  }
  if (!Array.isArray(store) || store.length < 1 || store.length > 15) {
    return "store must contain 1–15 store offers.";
  }

  for (const offer of store) {
    if (!offer || typeof offer !== "object") return "Each store offer must be an object.";
    if (typeof offer.name !== "string" || offer.name.trim().length < 1 || offer.name.length > 80) {
      return "Each store offer needs a valid name.";
    }
    const price = Number(offer.price);
    if (!Number.isFinite(price) || price <= 0 || price > 100000000) {
      return "Each store offer needs a positive numeric price.";
    }
    if (typeof offer.url !== "string" || !isHttpUrl(offer.url)) {
      return "Each store offer needs a valid HTTP(S) URL.";
    }
    if (offer.offer !== undefined && (typeof offer.offer !== "string" || offer.offer.length > 500)) {
      return "offer must be text up to 500 characters.";
    }
  }
  return null;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "oodlesnet-test-firestore-writer",
    mode: "test-only",
    projectLocked: "oodlesnet-test",
    writesEnabled: false,
    message: "POST requires bearer authentication and an explicit write confirmation.",
  });
}

export async function POST(request) {
  const token = process.env.TEST_WRITER_TOKEN;
  if (!token) return jsonError("Test writer authentication is not configured.", 503);

  const authorization = request.headers.get("authorization") || "";
  if (authorization !== `Bearer ${token}`) {
    return jsonError("Unauthorized.", 401);
  }

  // Apply a shared, persistent limit only after authentication succeeds.
  let rateLimitResponse;
  try {
    rateLimitResponse = await enforceTestWriterRateLimit(getDb());
  } catch {
    return jsonError("Test writer rate limiter is unavailable; request was not processed.", 503);
  }
  if (rateLimitResponse) return rateLimitResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  // Read-only verification for the isolated test database.
  if (body.action === "verify") {
    const documentId = body.documentId;
    if (typeof documentId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(documentId)) {
      return jsonError("A valid documentId is required for verification.", 400);
    }
    try {
      const db = getDb();
      const snapshot = await db.collection("products").doc(documentId).get();
      if (!snapshot.exists) {
        return NextResponse.json({
          ok: true,
          mode: "verified",
          targetProject: "oodlesnet-test",
          collection: "products",
          exists: false,
          documentId,
        });
      }
      const saved = snapshot.data();
      const timestampToIso = (value) =>
        value && typeof value.toDate === "function"
          ? value.toDate().toISOString()
          : value instanceof Date
            ? value.toISOString()
            : null;
      return NextResponse.json({
        ok: true,
        mode: "verified",
        targetProject: "oodlesnet-test",
        collection: "products",
        exists: true,
        documentId,
        product: {
          name: saved.name ?? null,
          brand: saved.brand ?? null,
          categorySlug: saved.categorySlug ?? null,
          description: saved.description ?? null,
          imageUrl: saved.imageUrl ?? null,
          tags: Array.isArray(saved.tags) ? saved.tags : [],
          impressions: saved.impressions ?? null,
          views: saved.views ?? null,
          store: Array.isArray(saved.store)
            ? saved.store.map((offer) => ({
                name: offer.name ?? null,
                price: offer.price ?? null,
                offer: offer.offer ?? null,
                url: offer.url ?? null,
              }))
            : [],
          createdAt: timestampToIso(saved.createdAt),
          updatedAt: timestampToIso(saved.updatedAt),
          source: saved.source ?? null,
        },
      });
    } catch {
      return jsonError("Test database read-back verification failed.", 500);
    }
  }

  const validationError = validateProduct(body.product);
  if (validationError) return jsonError(validationError, 400);

  // Dry-run is the default. A real write requires explicit confirmation.
  if (body.confirmWrite !== true) {
    return NextResponse.json({
      ok: true,
      mode: "dry-run",
      targetProject: "oodlesnet-test",
      collection: "products",
      validated: true,
      productName: body.product.name.trim(),
      message: "No data was written. Set confirmWrite=true to write to the test database.",
    });
  }

  try {
    const db = getDb();
    const product = body.product;
    const docId =
      typeof body.documentId === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(body.documentId)
        ? body.documentId
        : undefined;

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
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "chatgpt-test-writer",
    };

    const ref = docId
      ? db.collection("products").doc(docId)
      : db.collection("products").doc();

    // Never overwrite an existing document from this test endpoint.
    await ref.create(data);

    let audit = { logged: false };
    try {
      audit = {
        logged: true,
        eventId: await writeTestWriterAudit(db, {
          operation: "single_product_create",
          requested: 1,
          created: 1,
          duplicates: 0,
          failed: 0,
          outcome: "success",
        }),
      };
    } catch {
      // The product was already created; report audit failure clearly to avoid unsafe retries.
      audit = { logged: false, warning: "Product created, but audit logging failed. Do not retry this write." };
    }

    return NextResponse.json({
      ok: true,
      mode: "written",
      targetProject: "oodlesnet-test",
      collection: "products",
      documentId: ref.id,
      productName: data.name,
      audit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const errorCode = error && typeof error === "object" ? error.code : undefined;
    const isDuplicate =
      errorCode === 6 ||
      errorCode === "already-exists" ||
      message.toLowerCase().includes("already exists");
    const status = isDuplicate ? 409 : 500;
    return jsonError(status === 409 ? "That document ID already exists." : "Test database write failed.", status);
  }
}
