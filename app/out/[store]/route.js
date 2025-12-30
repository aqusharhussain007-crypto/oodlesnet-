import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const RATE_LIMIT_SECONDS = 15;

export async function GET(request, { params }) {
  const store = params.store;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("pid");
  const redirectUrl = searchParams.get("url");

  if (!productId || !redirectUrl) {
    return NextResponse.redirect("/");
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitRef = db
    .collection("rate_limits")
    .doc(`${ip}_${productId}_${store}`);

  const rateSnap = await rateLimitRef.get();
  const now = Date.now();

  let allowed = true;

  if (rateSnap.exists) {
    const last = rateSnap.data().lastClick?.toMillis?.() || 0;
    if (now - last < RATE_LIMIT_SECONDS * 1000) {
      allowed = false;
    }
  }

  // ✅ WRITE RATE LIMIT FIRST (CRITICAL)
  if (allowed) {
    await rateLimitRef.set(
      { lastClick: FieldValue.serverTimestamp() },
      { merge: true }
    );

    await db.collection("clicks").add({
      productId,
      store,
      ip,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.redirect(redirectUrl);
}
