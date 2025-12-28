import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-app";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const AFFILIATE_MAP = {
  amazon: "https://www.amazon.in/?tag=YOUR_TAG",
  ajio: "https://www.ajio.com/",
  meesho: "https://www.meesho.com/",
};

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("pid");
  const store = params.store;

  const targetUrl = AFFILIATE_MAP[store];

  if (!productId || !targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // log click
  await addDoc(collection(db, "clicks"), {
    productId,
    store,
    timestamp: serverTimestamp(),
  });

  return NextResponse.redirect(targetUrl);
}
