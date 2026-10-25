import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getClientKey, isLikelyBot, isRateLimited, isSameOriginRequest, rateDocRef, rateFields, readJsonBody } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const IMPRESSION_WINDOW_MS = 30 * 60 * 1000;

export async function POST(req) {
  try {
    if (!isSameOriginRequest(req)) return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
    if (isLikelyBot(req)) return NextResponse.json({ success: true, counted: false });
    if (!adminDb) return NextResponse.json({ success: false, error: "Tracking unavailable" }, { status: 503 });

    const body = await readJsonBody(req);
    if (body?.type !== "promise_impression") return NextResponse.json({ success: false, error: "Unsupported type" }, { status: 400 });

    const bannerRef = adminDb.collection("ads").doc("promise_banner");
    const rateRef = rateDocRef(`promo_${getClientKey(req)}`);
    const now = Date.now();
    const counted = await adminDb.runTransaction(async (tx) => {
      const rateSnap = await tx.get(rateRef);
      if (isRateLimited(rateSnap, now, IMPRESSION_WINDOW_MS)) return false;
      tx.set(bannerRef, { impressions: FieldValue.increment(1), type: "promise", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      tx.set(rateRef, rateFields(now, IMPRESSION_WINDOW_MS), { merge: true });
      return true;
    });
    return NextResponse.json({ success: true, counted });
  } catch (error) {
    console.error("TRACK IMPRESSION ERROR:", error?.message || "unknown error");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
