import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function isSameOriginRequest(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Tracking unavailable" }, { status: 503 });
    }

    const body = await req.json();

    if (body?.type === "promise_impression") {
      await adminDb.collection("ads").doc("promise_banner").set(
        {
          impressions: FieldValue.increment(1),
          type: "promise",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({ success: true });
    }

    const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
    const store = typeof body?.store === "string" ? body.store.trim().toLowerCase() : "";

    if (!productId || productId.length > 200 || productId.includes("/") || !store || store.length > 50) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    await adminDb.collection("clicks").add({
      productId,
      store,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TRACK CLICK ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
