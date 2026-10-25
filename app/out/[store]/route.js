import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const RATE_LIMIT_SECONDS = 5;

export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firestore not initialized" },
        { status: 503 }
      );
    }

    const { store } = params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("pid");

    if (
      !productId ||
      productId.length > 200 ||
      productId.includes("/") ||
      !store ||
      store.length > 50
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const storeSlug = store.toLowerCase();
    const doc = await adminDb.collection("products").doc(productId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = doc.data();
    const storeData = product.store?.find(
      (item) => item.name?.toLowerCase() === storeSlug
    );

    if (!storeData?.url) {
      return NextResponse.json({ error: "Store URL not found" }, { status: 404 });
    }

    let redirectUrl;
    try {
      redirectUrl = decodeURIComponent(storeData.url);
    } catch {
      redirectUrl = storeData.url;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(redirectUrl);
    } catch {
      return NextResponse.json({ error: "Invalid redirect URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Invalid redirect URL" }, { status: 400 });
    }

    // Await tracking before returning the redirect. Fire-and-forget writes can be
    // terminated when a serverless function finishes its response.
    try {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const rateRef = adminDb
        .collection("rate_limits")
        .doc(`${ip}_${productId}_${storeSlug}`);
      const now = Date.now();
      const rateSnap = await rateRef.get();
      const lastClick = rateSnap.exists
        ? rateSnap.data()?.lastClick?.toMillis?.() || 0
        : 0;

      if (now - lastClick >= RATE_LIMIT_SECONDS * 1000) {
        await adminDb.collection("clicks").add({
          productId,
          store: storeSlug,
          createdAt: FieldValue.serverTimestamp(),
        });
        await rateRef.set(
          { lastClick: FieldValue.serverTimestamp() },
          { merge: true }
        );
      }
    } catch (trackingError) {
      // Keep the purchase path working, but expose tracking failures in logs.
      console.error("OUT ROUTE TRACKING ERROR:", trackingError);
    }

    return NextResponse.redirect(parsedUrl.toString(), 302);
  } catch (error) {
    console.error("OUT ROUTE ERROR:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
