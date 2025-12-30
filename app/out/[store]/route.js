import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ---------- INIT ADMIN SDK (SAFE SINGLETON) ----------
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

// ---------- CONFIG ----------
const RATE_LIMIT_SECONDS = 5;

// ---------- ROUTE ----------
export async function GET(req, { params }) {
  const { store } = params;
  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("pid");
  const targetUrl = searchParams.get("url");

  if (!productId || !store || !targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateRef = db
    .collection("rate_limits")
    .doc(`${ip}_${productId}_${store}`);

  const now = Date.now();

  try {
    // ---------- RATE LIMIT CHECK ----------
    const snap = await rateRef.get();

    if (snap.exists) {
      const last = snap.data().ts?.toMillis?.() || 0;
      if (now - last < RATE_LIMIT_SECONDS * 1000) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
await db.collection("rate_limits").add({
  test: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});
    
    // ---------- WRITE RATE LIMIT (ALWAYS FIRST) ----------
    await rateRef.set({
      ip,
      productId,
      store,
      ts: FieldValue.serverTimestamp(),
    });

    // ---------- WRITE CLICK ----------
    await db.collection("clicks").add({
      productId,
      store,
      ip,
      createdAt: FieldValue.serverTimestamp(),
    });

    // ---------- REDIRECT ----------
    return NextResponse.redirect(targetUrl);
  } catch (err) {
    console.error("OUT ROUTE ERROR:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
