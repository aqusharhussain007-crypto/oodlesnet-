import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    await addDoc(collection(db, "clicks"), {
      productId: body.productId,
      store: body.store,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
