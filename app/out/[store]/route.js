import { NextResponse } from "next/server";
import admin from "firebase-admin";
import crypto from "crypto";

// --------------------
// FIREBASE ADMIN INIT
// --------------------
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
const { FieldValue } = admin.firestore;

// --------------------
// RATE LIMIT CONFIG
// --------------------
const RATE_LIMIT_SECONDS = 15; // temporary for testing

// --------------------
// FINGERPRINT HELPER
// --------------------
function getClientFingerprint(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "no-ip";

  const ua = request.headers.get("user-agent") || "no-ua";

  return crypto
    .createHash("sha256")
    .update(ip + ua)
    .digest("hex")
    .slice(0, 32);
}

// --------------------
// ROUTE HANDLER
// --------------------
export async function GET(request, { params }) {
  const store = params.store;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("pid");

  if (!productId || !store) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const fingerprint = getClientFingerprint(request);

  // --------------------
  // RATE LIMIT CHECK
  // --------------------
  const rateLimitRef = db
    .collection("rate_limits")
    .doc(`${fingerprint}_${productId}_${store}`);

  const rateSnap = await rateLimitRef.get();
  const now = Date.now();

  let allowed = true;

  if (rateSnap.exists) {
    const last =
      rateSnap.data().lastClick?.toMillis?.() || 0;

    if (now - last < RATE_LIMIT_SECONDS * 1000) {
      allowed = false;
    }
  }

  // --------------------
  // WRITE CLICK (SERVER ONLY)
  // --------------------
  if (allowed) {
    await Promise.all([
      db.collection("clicks").add({
        productId,
        store,
        createdAt: FieldValue.serverTimestamp(),
      }),
      rateLimitRef.set(
        {
          lastClick: FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
    ]);
  }

  // --------------------
  // REDIRECT TO STORE
  // --------------------
  const productSnap = await db
    .collection("products")
    .doc(productId)
    .get();

  if (!productSnap.exists) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const product = productSnap.data();
  const storeData = product.store?.find(
    (s) => s.name === store
  );

  if (!storeData?.url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(storeData.url);
         }
  
