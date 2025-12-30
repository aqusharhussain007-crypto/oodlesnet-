import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// --------------------
// Firebase Admin Init
// --------------------
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// --------------------
// Config
// --------------------
const RATE_LIMIT_SECONDS = 15;

// --------------------
// GET handler
// --------------------
export async function GET(request, { params }) {
  const store = params.store;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("pid");

  if (!store || !productId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Get client IP (Vercel-safe)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // --------------------
  // RATE LIMIT CHECK
  // --------------------
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

  // --------------------
  // WRITE CLICK (server only)
  // --------------------
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

  // --------------------
  // FETCH PRODUCT URL
  // --------------------
  let redirectUrl = "/";

  try {
    const productSnap = await db
      .collection("products")
      .doc(productId)
      .get();

    if (productSnap.exists) {
      const data = productSnap.data();
      const storeEntry = data.store?.find(
        (s) => s.name === store
      );
      if (storeEntry?.url) {
        redirectUrl = storeEntry.url;
      }
    }
  } catch (e) {
    console.error("Redirect fetch error:", e);
  }

  return NextResponse.redirect(redirectUrl);
        }
