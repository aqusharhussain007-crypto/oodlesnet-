import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-app";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    /**
     * 🔹 PROMISE BANNER IMPRESSION
     */
    if (body?.type === "promise_impression") {
      const ref = doc(db, "ads", "promise_banner");

      await setDoc(
        ref,
        {
          impressions: increment(1),
          type: "promise",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({ success: true });
    }

    /**
     * 🔹 NORMAL CLICK (existing behavior)
     */
    if (!body?.productId || !body?.store) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    await addDoc(collection(db, "clicks"), {
      productId: body.productId,
      store: String(body.store).toLowerCase(),
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("TRACK CLICK ERROR:", e);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
