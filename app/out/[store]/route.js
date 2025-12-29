import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serverTimestamp } from "firebase-admin/firestore";
import crypto from "crypto";

const RATE_LIMIT_SECONDS = 5;

function hash(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(req, { params }) {
  const { store } = params;
  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("pid");

  if (!productId || !store) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Get IP (works on Vercel)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const ipHash = hash(ip);
  const rateLimitId = `${store}_${productId}_${ipHash}`;

  try {
    if (adminDb) {
      const ref = adminDb.collection("rate_limits").doc(rateLimitId);
      const snap = await ref.get();

      const now = Date.now();
      let allowLog = true;

      if (snap.exists) {
        const last = snap.data().lastClickAt?.toMillis?.();
        if (last && now - last < RATE_LIMIT_SECONDS * 1000) {
          allowLog = false; // ⛔ too soon
        }
      }

      if (allowLog) {
        // log click
        await adminDb.collection("clicks").add({
          productId,
          store: store.toLowerCase(),
          createdAt: serverTimestamp(),
          ua: req.headers.get("user-agent") || null,
        });

        // update rate limit
        await ref.set(
          {
            productId,
            store: store.toLowerCase(),
            lastClickAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }
  } catch (e) {
    // never block redirect
    console.error("Rate limit / click log error:", e);
  }

  // 🔁 fetch product & redirect to store URL
  try {
    const productSnap = await adminDb
      .collection("products")
      .doc(productId)
      .get();

    if (productSnap.exists) {
      const product = productSnap.data();
      const match = (product.store || []).find(
        (s) => s.name?.toLowerCase() === store.toLowerCase()
      );
      if (match?.url) {
        return NextResponse.redirect(match.url);
      }
    }
  } catch (e) {
    console.error("Redirect fetch error:", e);
  }

  return NextResponse.redirect(new URL("/", req.url));
    }
          
