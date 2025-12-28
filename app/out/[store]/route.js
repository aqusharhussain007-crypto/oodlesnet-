import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-app";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const productId = searchParams.get("pid");
  const store = params.store;

  if (!targetUrl || !productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Log click
  await addDoc(collection(db, "clicks"), {
    productId,
    store,
    timestamp: serverTimestamp(),
  });

  return NextResponse.redirect(targetUrl);
      }
