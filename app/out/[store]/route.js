import { NextResponse } from "next/server";
import admin from "firebase-admin";

// --------------------
// Firebase Admin Init
// --------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// --------------------
// CONFIG
// --------------------
const RATE_LIMIT_SECONDS = 5;

// --------------------
// ROUTE
// --------------------
export async function GET(request, { params }) {
  try {
    const { store } = params;
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("pid");
    const targetUrl = searchParams.get("url");

    // ✅ HARD VALIDATION
    if (!productId || !store || !targetUrl) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // ✅ ALWAYS DECODE URL
    const decodedUrl = decodeURIComponent(targetUrl);

    // --------------------
    // REDIRECT FIRST (NO BLOCKING)
    // --------------------
    const response = NextResponse.redirect(decodedUrl, 302);

    // --------------------
    // FIRE & FORGET TRACKING
    // --------------------
    (async () => {
      try {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          "unknown";

        const rateRef = db
          .collection("rate_limits")
          .doc(`${ip}_${productId}_${store}`);

        const snap = await rateRef.get();
        const now = Date.now();

        let allowed = true;

        if (snap.exists) {
          const last =
            snap.data()?.lastClick?.toMillis?.() || 0;
          if (now - last < RATE_LIMIT_SECONDS * 1000) {
            allowed = false;
          }
        }

        if (allowed) {
          await Promise.all([
            db.collection("clicks").add({
              productId,
              store,
              ip,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }),
            rateRef.set(
              {
                lastClick:
                  admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            ),
          ]);
        }
      } catch (err) {
        console.error("Tracking error:", err);
      }
    })();

    return response;
  } catch (err) {
    console.error("OUT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
