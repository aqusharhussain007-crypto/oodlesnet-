import { NextResponse } from "next/server";
import admin from "firebase-admin";
import crypto from "crypto";

/* ---------------------------------------
   Firebase Admin – SAFE singleton init
---------------------------------------- */
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

/* ---------------------------------------
   Rate limit config (TEMP for testing)
---------------------------------------- */
const RATE_LIMIT_SECONDS = 15;

/* ---------------------------------------
   Fingerprint helper (stable on Vercel)
---------------------------------------- */
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

/* ---------------------------------------
   GET handler
---------------------------------------- */
export async function GET(request, { params }) {
  const store = params.store;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("pid");

  if (!store || !productId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  /* ---------------------------------------
     🔴 PROOF WRITE (TEMPORARY)
     This MUST create rate_limits collection
  ---------------------------------------- */
  await db.collection("rate_limits").doc("PROOF_VISIBLE").set({
    ok: true,
    createdAt: FieldValue.serverTimestamp(),
  });

  /* ---------------------------------------
     Rate limiting logic
  ---------------------------------------- */
  const fingerprint = getClientFingerprint(request);

  const rateLimitRef = db
    .collection("rate_limits")
    .doc(`${fingerprint}_${productId}_${store}`);

  const rateSnap = await rateLimitRef.get();
  const now = Date.now();

  let allowed = true;

  if (rateSnap.exists) {
    const last = rateSnap.data().lastClick?.toMillis?.() || 0;
    if (now - last < RATE_LIMIT_SECONDS * 1000) {
      allowed = false;
    }
  }

  /* ---------------------------------------
     Click tracking (server only)
  ---------------------------------------- */
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

  /* ---------------------------------------
     Resolve store URL
  ---------------------------------------- */
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

  /* ---------------------------------------
     Final redirect
  ---------------------------------------- */
  return NextResponse.redirect(storeData.url);
      }
  
