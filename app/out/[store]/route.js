import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const RATE_LIMIT_SECONDS = 15; // TEMP: testing

// ---------- Firebase init ----------
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ---------- Route ----------
export async function GET(request, { params }) {
  const { store } = params;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("pid");
  const targetUrl = searchParams.get("url");

  if (!productId || !store || !targetUrl) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  // Get IP (Vercel-safe)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitRef = db
    .collection("rate_limits")
    .doc(`${ip}_${productId}_${store}`);

  const snap = await rateLimitRef.get();
  const now = Date.now();

  let allowed = true;

  if (snap.exists) {
    const last = snap.data().lastClick?.toMillis?.() || 0;
    if (now - last < RATE_LIMIT_SECONDS * 1000) {
      allowed = false;
    }
  }

  if (allowed) {
    // IMPORTANT: await both writes
    await Promise.all([
      db.collection("clicks").add({
        productId,
        store,
        ip,
        createdAt: FieldValue.serverTimestamp(),
      }),
      rateLimitRef.set(
        { lastClick: FieldValue.serverTimestamp() },
        { merge: true }
      ),
    ]);
  }

  // 🚨 TEMP BLOCKING DELAY (FOR TESTING ONLY)
  await new Promise((r) => setTimeout(r, 800));

  return NextResponse.redirect(targetUrl, 302);
    }
   
