import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createHash, randomUUID } from "node:crypto";
import { writeTestWriterAudit } from "@/lib/test-writer-audit";
import { enforceTestWriterRateLimit } from "@/lib/test-writer-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_RECORDS = 50;

function fail(message, status) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function getDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId !== "oodlesnet-test") throw new Error("Batch writer is locked to oodlesnet-test.");
  if (!clientEmail || !privateKey) throw new Error("Test Firebase Admin credentials are not configured.");
  const app = getApps().find((item) => item.name === "oodlesnet-test-batch-writer") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, "oodlesnet-test-batch-writer");
  return getFirestore(app);
}

function isHttpUrl(value) {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; }
  catch { return false; }
}

function validateProduct(product, index) {
  const prefix = `Record ${index + 1}: `;
  if (!product || typeof product !== "object" || Array.isArray(product)) return prefix + "must be an object.";
  if (typeof product.name !== "string" || product.name.trim().length < 2 || product.name.length > 180) return prefix + "name must be 2–180 characters.";
  if (typeof product.brand !== "string" || !product.brand.trim() || product.brand.length > 100) return prefix + "brand is required (max 100 characters).";
  if (typeof product.categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(product.categorySlug)) return prefix + "categorySlug must use lowercase letters, numbers, and hyphens.";
  if (product.description !== undefined && (typeof product.description !== "string" || product.description.length > 3000)) return prefix + "description must be text up to 3000 characters.";
  if (product.imageUrl !== undefined && product.imageUrl !== "" && !isHttpUrl(product.imageUrl)) return prefix + "imageUrl must be an HTTP(S) URL.";
  if (product.tags !== undefined && (!Array.isArray(product.tags) || product.tags.length > 30 || product.tags.some((tag) => typeof tag !== "string" || tag.length > 50))) return prefix + "tags must be up to 30 short strings.";
  if (!Array.isArray(product.store) || product.store.length < 1 || product.store.length > 15) return prefix + "store must contain 1–15 offers.";
  for (const offer of product.store) {
    if (!offer || typeof offer !== "object" || typeof offer.name !== "string" || !offer.name.trim() || offer.name.length > 80) return prefix + "each store offer needs a valid name.";
    const price = Number(offer.price);
    if (!Number.isFinite(price) || price <= 0 || price > 100000000) return prefix + "each store offer needs a positive price.";
    if (typeof offer.url !== "string" || !isHttpUrl(offer.url)) return prefix + "each store offer needs a valid HTTP(S) URL.";
    if (offer.offer !== undefined && (typeof offer.offer !== "string" || offer.offer.length > 500)) return prefix + "offer must be text up to 500 characters.";
  }
  if (product.documentId !== undefined && (typeof product.documentId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(product.documentId))) return prefix + "documentId contains invalid characters.";
  return null;
}

// Minimal CSV parser supporting quoted fields, escaped quotes, commas and newlines inside quoted fields.
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell.length === 0) quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((item) => item.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (quoted) throw new Error("CSV has an unclosed quoted field.");
  row.push(cell);
  if (row.some((item) => item.trim() !== "")) rows.push(row);
  if (rows.length < 2) throw new Error("CSV needs a header and at least one data row.");
  const headers = rows[0].map((item) => item.trim());
  if (new Set(headers).size !== headers.length) throw new Error("CSV has duplicate column names.");
  const required = ["name", "brand", "categorySlug", "store"];
  for (const key of required) if (!headers.includes(key)) throw new Error(`CSV is missing required column: ${key}`);
  return rows.slice(1).map((cells, index) => {
    if (cells.length !== headers.length) throw new Error(`CSV row ${index + 2} has ${cells.length} cells; expected ${headers.length}.`);
    const record = Object.fromEntries(headers.map((header, i) => [header, cells[i]]));
    let store, tags;
    try { store = JSON.parse(record.store); } catch { throw new Error(`CSV row ${index + 2}: store must be a JSON array of offers.`); }
    if (record.tags?.trim()) {
      try { tags = JSON.parse(record.tags); } catch { throw new Error(`CSV row ${index + 2}: tags must be a JSON array.`); }
    }
    return { ...record, price: undefined, tags: tags ?? [], store, documentId: record.documentId?.trim() || undefined };
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "oodlesnet-test-batch-writer",
    projectLocked: "oodlesnet-test",
    maxRecords: MAX_RECORDS,
    formats: ["JSON array", "CSV with a JSON-encoded store column and optional JSON tags column"],
    writesEnabled: false,
  });
}

export async function POST(request) {
  const token = process.env.TEST_WRITER_TOKEN;
  if (!token) return fail("Test writer authentication is not configured.", 503);
  if (request.headers.get("authorization") !== `Bearer ${token}`) return fail("Unauthorized.", 401);

  // Apply a shared, persistent limit only after authentication succeeds.
  let rateLimitResponse;
  try {
    rateLimitResponse = await enforceTestWriterRateLimit(getDb());
  } catch {
    return fail("Test writer rate limiter is unavailable; request was not processed.", 503);
  }
  if (rateLimitResponse) return rateLimitResponse;

  let body;
  try { body = await request.json(); } catch { return fail("Request body must be valid JSON.", 400); }
  if (!body || typeof body !== "object" || !["json", "csv"].includes(body.format) || typeof body.data !== "string") {
    return fail("Send format=json|csv and data as text.", 400);
  }
  if (body.data.length > 500000) return fail("Input exceeds the 500 KB limit.", 413);

  let products;
  try {
    products = body.format === "json" ? JSON.parse(body.data) : parseCsv(body.data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not parse input.", 400);
  }
  if (!Array.isArray(products) || products.length < 1 || products.length > MAX_RECORDS) {
    return fail(`Input must contain 1–${MAX_RECORDS} products.`, 400);
  }
  const batchId = typeof body.batchId === "string" ? body.batchId.trim() : "";
  if (body.confirmWrite === true && !/^[A-Za-z0-9_-]{8,100}$/.test(batchId)) {
    return fail("A stable batchId (8–100 letters, numbers, hyphens, or underscores) is required for writes. Reuse it only when retrying the exact same batch.", 400);
  }
  const errors = products.map((product, index) => validateProduct(product, index)).filter(Boolean);
  if (errors.length) return NextResponse.json({ ok: false, mode: "rejected", targetProject: "oodlesnet-test", errors }, { status: 400 });

  const ids = products.map((product) => product.documentId).filter(Boolean);
  if (new Set(ids).size !== ids.length) return fail("Input contains duplicate documentId values.", 400);

  const normalized = products.map((product) => ({
    documentId: product.documentId,
    data: {
      name: product.name.trim(),
      brand: product.brand.trim(),
      categorySlug: product.categorySlug,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      tags: Array.isArray(product.tags) ? product.tags : [],
      impressions: 0,
      views: 0,
      store: product.store.map((offer) => ({ name: offer.name.trim(), price: Number(offer.price), offer: offer.offer || "", url: offer.url })),
      source: "chatgpt-test-batch-writer",
    },
  }));

  if (body.confirmWrite !== true) {
    return NextResponse.json({
      ok: true, mode: "dry-run", targetProject: "oodlesnet-test", collection: "products",
      count: normalized.length, validated: true,
      products: normalized.map((item) => ({ documentId: item.documentId ?? null, name: item.data.name, storeOffers: item.data.store.length })),
      message: "No data was written. Set confirmWrite=true to create these test records.",
    });
  }

  try {
    const db = getDb();
    const batchRef = db.collection("test_writer_batches").doc(batchId);
    const payloadHash = createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
    const existingBatch = await batchRef.get();
    if (existingBatch.exists) {
      const savedBatch = existingBatch.data();
      if (savedBatch.payloadHash !== payloadHash) {
        return fail("This batchId was already used with different data. Use the original data to recover this batch, or choose a new batchId for a new import.", 409);
      }
    } else {
      try {
        await batchRef.create({
          batchId,
          payloadHash,
          requested: normalized.length,
          status: "in_progress",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        // Another request may have initialized the same batch concurrently; verify its manifest below.
        const latest = await batchRef.get();
        if (!latest.exists || latest.data().payloadHash !== payloadHash) {
          return fail("Could not safely initialize this batch. Retry with the same batchId and unchanged data.", 409);
        }
      }
    }

    const results = [];
    for (let index = 0; index < normalized.length; index++) {
      const item = normalized[index];
      // Stable IDs make retries safe after timeouts or partial writes.
      const generatedId = createHash("sha256").update(`${batchId}:${index}`).digest("hex").slice(0, 32);
      const ref = item.documentId ? db.collection("products").doc(item.documentId) : db.collection("products").doc(generatedId);
      try {
        await ref.create({ ...item.data, createdAt: new Date(), updatedAt: new Date(), importBatchId: batchId, importRow: index + 1 });
        results.push({ documentId: ref.id, name: item.data.name, status: "created" });
      } catch (error) {
        const code = error && typeof error === "object" ? error.code : undefined;
        const message = error instanceof Error ? error.message : "";
        const duplicate = code === 6 || code === "already-exists" || message.toLowerCase().includes("already exists");
        if (duplicate) {
          // A deterministic ID that belongs to this same batch is a safely recovered prior success.
          try {
            const saved = await ref.get();
            const savedData = saved.data();
            const recovered = saved.exists && savedData.importBatchId === batchId && savedData.importRow === index + 1;
            results.push({ documentId: ref.id, name: item.data.name, status: recovered ? "already_created_by_this_batch" : "duplicate" });
          } catch {
            results.push({ documentId: ref.id, name: item.data.name, status: "failed" });
          }
        } else {
          results.push({ documentId: ref.id, name: item.data.name, status: "failed" });
        }
      }
    }
    const created = results.filter((item) => item.status === "created").length;
    const recovered = results.filter((item) => item.status === "already_created_by_this_batch").length;
    const duplicates = results.filter((item) => item.status === "duplicate").length;
    const failed = results.filter((item) => item.status === "failed").length;
    const status = failed > 0 ? "partial_failure" : duplicates > 0 ? "completed_with_duplicates" : "completed";
    let batchTracking = { saved: false };
    try {
      await batchRef.set({ status, requested: results.length, created: created + recovered, newlyCreated: created, recovered, duplicates, failed, updatedAt: new Date() }, { merge: true });
      batchTracking = { saved: true, status };
    } catch {
      batchTracking = {
        saved: false,
        warning: "Product write attempts completed, but batch progress could not be saved. Review each result and retry only with the same Batch ID and unchanged data.",
      };
    }

    let audit = { logged: false };
    try {
      audit = {
        logged: true,
        eventId: await writeTestWriterAudit(db, {
          operation: "batch_product_create",
          batchId,
          requested: results.length,
          created: created + recovered,
          duplicates,
          failed,
          outcome: failed > 0 ? "partial_failure" : duplicates > 0 ? "completed_with_duplicates" : recovered > 0 ? "recovered_retry" : "success",
        }),
      };
    } catch {
      // Writes may already have succeeded. Do not hide that fact or encourage blind retries.
      audit = { logged: false, warning: "Batch writes were attempted, but audit logging failed. Review per-record results before any retry." };
    }

    return NextResponse.json({
      ok: failed === 0 && duplicates === 0,
      mode: "written",
      targetProject: "oodlesnet-test",
      collection: "products",
      batchId,
      requested: results.length,
      created: created + recovered,
      newlyCreated: created,
      recovered,
      duplicates,
      failed,
      batchTracking,
      audit,
      results,
      message: "Create-only writes were attempted. Reuse this batchId and the exact same data to safely recover a partial batch; existing documents are never overwritten.",
    }, { status: failed || duplicates ? 207 : 200 });
  } catch {
    return fail("Test batch writer could not connect to the isolated test database.", 500);
  }
}
