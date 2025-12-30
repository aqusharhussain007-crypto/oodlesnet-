import { NextResponse } from "next/server";
import admin from "firebase-admin";

/* -------------------------------------------------
   Firebase Admin (SAFE for Vercel)
-------------------------------------------------- */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// 5 seconds rate limit (can tune later)
const RATE_LIMIT_MS = 5 * 1000;

/* -------------------------------------------------
   Route
-------------------------------------------------- */
export async function GET(request, { params }) {
  try {
    const { store } = params;
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("pid");
    const targetUrl = searchParams.get("url");

    if (!productId || !store || !targetUrl) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Vercel-safe IP detection
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const rateDocId = `${ip}_${productId}_${store}`;
    const rateRef = db.collection("rate_limits").doc(rateDocId);

    let allowWrite = true;

    // ---- Rate limit check (non-blocking) ----
    try {
      const snap = await rateRef.get();
      if (snap.exists) {
        const last = snap.data()?.lastClick?.toMillis?.() || 0;
        if (now - last < RATE_LIMIT_MS) {
          allowWrite = false;
        }
      }
    } catch {
      // ignore rate-limit read failures
    }

    // ---- Writes (never block redirect) ----
    if (allowWrite) {
      Promise.allSettled([
        db.collection("clicks").add({
          productId,
          store,
          ip,
          createdAt: FieldValue.serverTimestamp(),
        }),
        rateRef.set(
          { lastClick: FieldValue.serverTimestamp() },
          { merge: true }
        ),
      ]);
    }

    // ---- Redirect ALWAYS happens ----
    return NextResponse.redirect(targetUrl, 302);
  } catch (err) {
    console.error("OUT ROUTE ERROR:", err);

    // Even on failure, try redirect if possible
    try {
      const { searchParams } = new URL(request.url);
      const targetUrl = searchParams.get("url");
      if (targetUrl) {
        return NextResponse.redirect(targetUrl, 302);
      }
    } catch {}

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
         }
      
