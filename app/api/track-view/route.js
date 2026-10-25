import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getClientKey, hashValue, isLikelyBot, isRateLimited, isSameOriginRequest, isValidDocId, rateDocRef, rateFields, readJsonBody } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const VIEW_WINDOW_MS = 30 * 60 * 1000;

export async function POST(req) {
  try {
    if (!isSameOriginRequest(req)) return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
    if (isLikelyBot(req)) return NextResponse.json({ success: true, counted: false });
    if (!adminDb) return NextResponse.json({ success: false, error: "Tracking unavailable" }, { status: 503 });

    const body = await readJsonBody(req);
    const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
    if (!isValidDocId(productId)) return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });

    const productRef = adminDb.collection("products").doc(productId);
    const rateRef = rateDocRef(`view_${getClientKey(req)}_${hashValue(productId, 20)}`);
    const now = Date.now();
    const result = await adminDb.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef);
      if (!productSnap.exists) return "missing";
      const rateSnap = await tx.get(rateRef);
      if (isRateLimited(rateSnap, now, VIEW_WINDOW_MS)) return "limited";
      tx.update(productRef, { views: FieldValue.increment(1) });
      tx.set(rateRef, rateFields(now, VIEW_WINDOW_MS), { merge: true });
      return "counted";
    });
    if (result === "missing") return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, counted: result === "counted" });
  } catch (error) {
    console.error("TRACK VIEW ERROR:", error?.message || "unknown error");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
