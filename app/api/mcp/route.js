import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ID = "oodlesnet-test";
const MAX_BYTES = 50_000;
const PROTOCOL_VERSION = "2025-03-26";

function jsonRpc(id, result) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, {
    headers: { "Cache-Control": "no-store" },
  });
}

function rpcError(id, code, message) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, {
    status: 400,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalizePrivateKey(raw) {
  let key = String(raw || "").trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) key = key.slice(1, -1);
  return key.replace(/\\n/g, "\n");
}

function getDb() {
  if (process.env.FIREBASE_PROJECT_ID !== PROJECT_ID) throw new Error("Test bridge is locked to oodlesnet-test.");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (!clientEmail || !privateKey) throw new Error("Firebase Admin credentials are not configured.");
  const name = "oodlesnet-chatgpt-test-mcp";
  const app = getApps().find((item) => item.name === name) ?? initializeApp({
    credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }),
    projectId: PROJECT_ID,
  }, name);
  return getFirestore(app);
}

function checkProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) return "product must be an object";
  if (typeof product.name !== "string" || product.name.trim().length < 2 || product.name.length > 180) return "name must be 2–180 characters";
  if (typeof product.brand !== "string" || !product.brand.trim() || product.brand.length > 100) return "brand is required (max 100 characters)";
  if (typeof product.categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(product.categorySlug)) return "categorySlug must be lowercase letters, numbers, and hyphens";
  if (!Array.isArray(product.store) || product.store.length < 1 || product.store.length > 15) return "store must contain 1–15 offers";
  for (const offer of product.store) {
    if (!offer || typeof offer.name !== "string" || !offer.name.trim() || offer.name.length > 80) return "each offer needs a store name";
    if (!Number.isFinite(Number(offer.price)) || Number(offer.price) <= 0 || Number(offer.price) > 100000000) return "each offer needs a positive price";
    try {
      const u = new URL(offer.url);
      if (!["http:", "https:"].includes(u.protocol)) return "each offer needs an HTTP(S) URL";
    } catch { return "each offer needs a valid HTTP(S) URL"; }
  }
  return null;
}

const tools = [
  {
    name: "search_products",
    description: "Search the isolated oodlesnet-test Firestore products collection by a name fragment. Read-only; returns at most 20 matches.",
    inputSchema: { type: "object", properties: { query: { type: "string", minLength: 1, maxLength: 100 } }, required: ["query"], additionalProperties: false },
  },
  {
    name: "verify_product",
    description: "Read one product document by exact Firestore document ID from oodlesnet-test. Read-only.",
    inputSchema: { type: "object", properties: { documentId: { type: "string", minLength: 1, maxLength: 100 } }, required: ["documentId"], additionalProperties: false },
  },
  {
    name: "create_product",
    description: "Create a product in the isolated oodlesnet-test project only. Requires confirmWrite=true. Never overwrites an existing document.",
    inputSchema: {
      type: "object",
      properties: {
        documentId: { type: "string", pattern: "^[A-Za-z0-9_-]{1,100}$" },
        product: {
          type: "object",
          properties: {
            name: { type: "string" }, brand: { type: "string" }, categorySlug: { type: "string" },
            description: { type: "string" }, imageUrl: { type: "string" }, tags: { type: "array", items: { type: "string" } },
            store: { type: "array", items: { type: "object", properties: { name: { type: "string" }, price: { type: "number" }, offer: { type: "string" }, url: { type: "string" } }, required: ["name", "price", "url"], additionalProperties: false } },
          },
          required: ["name", "brand", "categorySlug", "store"], additionalProperties: false,
        },
        confirmWrite: { type: "boolean" },
      },
      required: ["product", "confirmWrite"], additionalProperties: false,
    },
  },
  {
    name: "update_price",
    description: "Update only the price of one existing store offer in oodlesnet-test. Identifies the product by document ID and offer by exact store name. Requires confirmWrite=true.",
    inputSchema: {
      type: "object",
      properties: {
        documentId: { type: "string", minLength: 1, maxLength: 100 },
        storeName: { type: "string", minLength: 1, maxLength: 80 },
        newPrice: { type: "number", exclusiveMinimum: 0, maximum: 100000000 },
        confirmWrite: { type: "boolean" },
      },
      required: ["documentId", "storeName", "newPrice", "confirmWrite"], additionalProperties: false,
    },
  },
];

async function callTool(name, args) {
  const db = getDb();
  const products = db.collection("products");

  if (name === "search_products") {
    const q = String(args.query || "").trim().toLowerCase();
    if (!q) throw new Error("query is required");
    const snap = await products.limit(200).get();
    const matches = snap.docs.filter((doc) => String(doc.get("name") || "").toLowerCase().includes(q)).slice(0, 20);
    return { project: PROJECT_ID, count: matches.length, products: matches.map((doc) => ({ documentId: doc.id, name: doc.get("name"), brand: doc.get("brand"), categorySlug: doc.get("categorySlug") })) };
  }

  if (name === "verify_product") {
    const id = String(args.documentId || "");
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) throw new Error("invalid documentId");
    const doc = await products.doc(id).get();
    return doc.exists ? { project: PROJECT_ID, exists: true, documentId: doc.id, product: doc.data() } : { project: PROJECT_ID, exists: false, documentId: id };
  }

  if (name === "create_product") {
    const error = checkProduct(args.product);
    if (error) throw new Error(error);
    if (args.confirmWrite !== true) return { mode: "dry-run", project: PROJECT_ID, validated: true, name: args.product.name, storeOffers: args.product.store.length, message: "No write performed. Repeat with confirmWrite=true after review." };
    const data = {
      name: args.product.name.trim(), brand: args.product.brand.trim(), categorySlug: args.product.categorySlug,
      description: args.product.description || "", imageUrl: args.product.imageUrl || "",
      tags: Array.isArray(args.product.tags) ? args.product.tags : [], impressions: 0, views: 0,
      store: args.product.store.map((offer) => ({ name: offer.name.trim(), price: Number(offer.price), offer: offer.offer || "", url: offer.url })),
      source: "chatgpt-test-mcp",
    };
    const id = args.documentId;
    if (id !== undefined && (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(id))) throw new Error("invalid documentId");
    const ref = id ? products.doc(id) : products.doc();
    await ref.create({ ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    await db.collection("product_writer_audit").add({ operation: "chatgpt-test-create", collection: "products", documentId: ref.id, productName: data.name, createdAt: FieldValue.serverTimestamp() });
    return { mode: "written", project: PROJECT_ID, collection: "products", documentId: ref.id, productName: data.name };
  }

  if (name === "update_price") {
    const id = String(args.documentId || "");
    const storeName = String(args.storeName || "").trim();
    const price = Number(args.newPrice);
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(id) || !storeName || storeName.length > 80 || !Number.isFinite(price) || price <= 0 || price > 100000000) throw new Error("invalid documentId, storeName, or newPrice");
    const ref = products.doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("product not found");
    const current = snap.get("store");
    if (!Array.isArray(current)) throw new Error("product has no valid store offers");
    const matches = current.filter((offer) => offer && offer.name === storeName).length;
    if (matches !== 1) throw new Error(matches ? "storeName matches multiple offers; no update made" : "exact storeName not found; no update made");
    if (args.confirmWrite !== true) return { mode: "dry-run", project: PROJECT_ID, documentId: id, storeName, oldPrice: current.find((offer) => offer.name === storeName).price, newPrice: price, message: "No write performed. Repeat with confirmWrite=true after review." };
    const updated = current.map((offer) => offer.name === storeName ? { ...offer, price } : offer);
    await ref.update({ store: updated, updatedAt: FieldValue.serverTimestamp() });
    await db.collection("product_writer_audit").add({ operation: "chatgpt-test-price-update", collection: "products", documentId: id, storeName, newPrice: price, createdAt: FieldValue.serverTimestamp() });
    return { mode: "written", project: PROJECT_ID, documentId: id, storeName, newPrice: price };
  }

  throw new Error("unknown tool");
}

export async function GET() {
  return NextResponse.json({ service: "oodlesnet-chatgpt-test-mcp", projectLocked: PROJECT_ID, protocol: "MCP Streamable HTTP", configured: Boolean(process.env.CHATGPT_MCP_API_KEY && process.env.FIREBASE_PROJECT_ID === PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY), message: "Test-project only. No production database access." }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const expected = process.env.CHATGPT_MCP_API_KEY;
  const auth = request.headers.get("authorization") || "";
  if (!expected || !auth.startsWith("Bearer ") || auth.slice(7) !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BYTES) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  let body;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") return rpcError(body?.id, -32600, "Invalid JSON-RPC request");

  if (body.method === "initialize") {
    return jsonRpc(body.id, { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {} }, serverInfo: { name: "oodlesnet-chatgpt-test-mcp", version: "0.1.0" } });
  }
  if (body.method === "notifications/initialized" || body.method === "notifications/cancelled") {
    return new NextResponse(null, { status: 202, headers: { "Cache-Control": "no-store" } });
  }
  if (body.method === "ping") return jsonRpc(body.id, {});
  if (body.method === "tools/list") return jsonRpc(body.id, { tools });
  if (body.method === "tools/call") {
    const params = body.params || {};
    const tool = tools.find((item) => item.name === params.name);
    if (!tool) return rpcError(body.id, -32602, "Unknown tool");
    try {
      const result = await callTool(params.name, params.arguments || {});
      return jsonRpc(body.id, { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result, isError: false });
    } catch (error) {
      return jsonRpc(body.id, { content: [{ type: "text", text: error instanceof Error ? error.message : "Tool call failed" }], isError: true });
    }
  }
  return rpcError(body.id, -32601, "Method not found");
}
