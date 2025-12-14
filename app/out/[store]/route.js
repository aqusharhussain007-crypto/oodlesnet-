import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-app";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);

    const pid = searchParams.get("pid");
    const targetUrl = searchParams.get("url");

    if (!pid || !targetUrl) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Increment product views
    const ref = doc(db, "products", pid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, {
        views: increment(1),
      });
    }

    // Redirect to store
    return NextResponse.redirect(targetUrl);
  } catch (e) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  }
      
