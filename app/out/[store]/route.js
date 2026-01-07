import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/* --------------------
   CONFIG
-------------------- */
const RATE_LIMIT_SECONDS = 5;

/* --------------------
   ROUTE
-------------------- */
export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firestore not initialized" },
        { status: 500 }
      );
    }

    const { store } = params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("pid");

    if (!productId || !store) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    /* --------------------
       FETCH PRODUCT
    -------------------- */
    const doc = await adminDb
      .collection("products")
      .doc(productId)
      .get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = doc.data();

    const storeData = product.store?.find(
      (s) => s.name?.toLowerCase() === store.toLowerCase()
    );

    if (!storeData?.url) {
      return NextResponse.json(
        { error: "Store URL not found" },
        { status: 404 }
      );
    }

    /* --------------------
       HANDLE RAW OR ENCODED URL (SAFE)
    -------------------- */
    let redirectUrl;
    try {
      redirectUrl = decodeURIComponent(storeData.url);
    } catch {
      redirectUrl = storeData.url;
    }

    // ensure final URL is safely encoded
    redirectUrl = encodeURI(redirectUrl);

    /* --------------------
       SAFETY CHECK
    -------------------- */
    if (!redirectUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid redirect URL" },
        { status: 400 }
      );
    }

    /* --------------------
       FIRE & FORGET TRACKING
    -------------------- */
    (async () => {
      try {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          "unknown";

        const rateRef = adminDb
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
            adminDb.collection("clicks").add({
              productId,
              store,
              ip,
              createdAt: FieldValue.serverTimestamp(),
            }),
            rateRef.set(
              {
                lastClick: FieldValue.serverTimestamp(),
              },
              { merge: true }
            ),
          ]);
        }
      } catch (e) {
        console.error("Tracking error:", e);
      }
    })();

    /* --------------------
       REDIRECT
    -------------------- */
    return NextResponse.redirect(redirectUrl, 302);
  } catch (err) {
    console.error("OUT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
  }
  
