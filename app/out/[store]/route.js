import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getClientKey, hashValue, isLikelyBot, isRateLimited, isValidDocId, isValidStoreName, rateDocRef, rateFields } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const RATE_LIMIT_MS = 5000;
const TRACKING_TIMEOUT_MS = 800;

async function loadProduct(productId) {
  if (adminDb) {
    try {
      const snap = await adminDb.collection("products").doc(productId).get();
      return snap.exists ? snap.data() : null;
    } catch (error) {
      console.error("OUT admin lookup failed:", error?.message || "unknown error");
    }
  }
  const snap = await getDoc(doc(db, "products", productId));
  return snap.exists() ? snap.data() : null;
}

async function trackClick(request, productId, storeSlug) {
  if (!adminDb || isLikelyBot(request) || !isValidStoreName(storeSlug)) return;
  const clientKey = getClientKey(request);
  const rateRef = rateDocRef(`click_${clientKey}_${hashValue(productId, 20)}_${hashValue(storeSlug, 12)}`);
  const clickRef = adminDb.collection("clicks").doc();
  const now = Date.now();
  await adminDb.runTransaction(async (tx) => {
    const rateSnap = await tx.get(rateRef);
    if (isRateLimited(rateSnap, now, RATE_LIMIT_MS)) return;
    tx.set(clickRef, { productId, store: storeSlug, ipHash: clientKey, createdAt: FieldValue.serverTimestamp() });
    tx.set(rateRef, rateFields(now, RATE_LIMIT_MS), { merge: true });
  });
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(resolve, ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = (searchParams.get("pid") || "").trim();
    let storeSlug = String(params?.store || "").trim().toLowerCase();

    if (!isValidDocId(productId) || !storeSlug || storeSlug.length > 100) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const product = await loadProduct(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const storeData = Array.isArray(product.store) ? product.store.find((s) => s.name?.toLowerCase() === storeSlug) : null;
    if (!storeData?.url) return NextResponse.json({ error: "Store URL not found" }, { status: 404 });

    let redirectUrl;
    try { redirectUrl = decodeURIComponent(storeData.url); } catch { redirectUrl = storeData.url; }
    let parsed;
    try { parsed = new URL(redirectUrl); } catch {
      return NextResponse.json({ error: "Invalid redirect URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Invalid redirect URL" }, { status: 400 });
    }

    try {
      await withTimeout(trackClick(request, productId, storeSlug).catch((error) => {
        console.error("OUT ROUTE TRACKING ERROR:", error?.message || "unknown error");
      }), TRACKING_TIMEOUT_MS);
    } catch (error) {
      console.error("OUT ROUTE TRACKING ERROR:", error?.message || "unknown error");
    }

    const response = NextResponse.redirect(parsed.toString(), 302);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("OUT ROUTE ERROR:", error?.message || "unknown error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
