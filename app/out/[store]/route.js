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
const FieldValue = admin.firestore.FieldValue;

// --------------------
// Config
// --------------------
const RATE_LIMIT_SECONDS = 15; // TEMP for testing

// --------------------
// Route
// --------------------
export async function GET(request, { params }) {
  try {
    const { store } = params;
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("pid");
    const targetUrl = searchParams.get("url");

    if (!store || !productId || !targetUrl) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    // Get IP (Vercel-safe)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();

    // --------------------
    // Rate limit doc
    // --------------------
    const rateLimitRef = db
      .collection("rate_limits")
      .doc(`${ip}_${productId}_${store}`);

    const rateSnap = await rateLimitRef.get();

    let allowed = true;

    if (rateSnap.exists) {
      const last = rateSnap.data().lastClick?.toMillis?.() || 0;
      if (now - last < RATE_LIMIT_SECONDS * 1000) {
        allowed = false;
      }
    }

    // --------------------
    // Write click + rate limit
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
    // Redirect to store
    // --------------------
    return NextResponse.redirect(targetUrl, 302);
  } catch (err) {
    console.error("OUT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
  
