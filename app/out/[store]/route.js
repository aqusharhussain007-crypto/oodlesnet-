import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serverTimestamp } from "firebase-admin/firestore";

export async function GET(req, { params }) {
  const { store } = params;
  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("pid");
  const targetUrl = searchParams.get("url");

  if (!productId || !store || !targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    if (adminDb) {
      await adminDb.collection("clicks").add({
        productId,
        store: store.toLowerCase(),
        createdAt: serverTimestamp(),
        ua: req.headers.get("user-agent") || null,
      });
    }
  } catch (e) {
    console.error("Click log failed:", e);
  }

  return NextResponse.redirect(targetUrl);
}
