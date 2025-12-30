import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/* ----------------------------------
   Firebase Admin init (SAFE)
----------------------------------- */
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

/* ----------------------------------
   CONFIG
----------------------------------- */
const RATE_LIMIT_SECONDS = 15; // temporary for testing

/* ----------------------------------
   GET /out/[store]?pid=PRODUCT_ID
----------------------------------- */
export async function GET(request, { params }) {
  const store = params.store;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("pid");

  if (!store || !productId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  /* ----------------------------------
     Get client IP (Vercel safe)
  ----------------------------------- */
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitId = `${ip}_${productId}_${store}`;
  const rateLimitRef = db.collection("rate_limits").doc(rateLimitId);

  const now = Date.now();
  let allowed = true;

  /* ----------------------------------
     Rate-limit check
  ----------------------------------- */
  const rateSnap = await rateLimitRef.get();

  if (rateSnap.exists) {
    const last =
      rateSnap.data().lastClick?.toMillis?.() || 0;

    if (now - last < RATE_LIMIT_SECONDS * 1000) {
      allowed = false;
    }
  }

  /* ----------------------------------
     Write click + rate limit
  ----------------------------------- */
  if (allowed) {
    await Promise.all([
      db.collection("clicks").add({
        productId,
        store,
        ip,
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

  /* ----------------------------------
     Redirect to store URL
  ----------------------------------- */
  const productSnap = await db
    .collection("products")
    .doc(productId)
    .get();

  if (!productSnap.exists) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const product = productSnap.data();
  const storeEntry = product.store?.find(
    (s) => s.name === store
  );

  if (!storeEntry?.url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(storeEntry.url);
}
