import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const VIEW_WINDOW_MS = 30 * 60 * 1000;

function getClientKey(req) {
  const ip = req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

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
  let stage = "origin-validation";

  try {
    if (!isSameOriginRequest(req)) {
      console.warn("TRACK VIEW DIAGNOSTIC:", { stage, result: "rejected" });
      return NextResponse.json(
        { success: false, stage, error: "Invalid origin" },
        { status: 403 }
      );
    }

    stage = "admin-initialization";
    if (!adminDb) {
      console.error("TRACK VIEW DIAGNOSTIC:", { stage, result: "adminDb-null" });
      return NextResponse.json(
        { success: false, stage, error: "Tracking unavailable" },
        { status: 503 }
      );
    }

    stage = "request-body";
    const body = await req.json();
    const productId = typeof body?.productId === "string" ? body.productId.trim() : "";

    if (!productId || productId.length > 200 || productId.includes("/")) {
      return NextResponse.json(
        { success: false, stage, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    stage = "firestore-transaction";
    const productRef = adminDb.collection("products").doc(productId);
    const rateRef = adminDb.collection("rate_limits").doc(
      `view_${getClientKey(req)}_${createHash("sha256").update(productId).digest("hex").slice(0, 20)}`
    );
    const now = Date.now();

    const result = await adminDb.runTransaction(async (transaction) => {
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists) return "missing";

      const rateSnap = await transaction.get(rateRef);
      const lastView = rateSnap.exists ? Number(rateSnap.data()?.lastViewMs || 0) : 0;

      if (now - lastView < VIEW_WINDOW_MS) return "limited";

      transaction.update(productRef, { views: FieldValue.increment(1) });
      transaction.set(rateRef, { lastViewMs: now }, { merge: true });
      return "counted";
    });

    if (result === "missing") {
      return NextResponse.json(
        { success: false, counted: false, stage, error: "Product not found" },
        { status: 404 }
      );
    }

    console.info("TRACK VIEW DIAGNOSTIC:", { stage, result, productId });
    return NextResponse.json({ success: true, counted: result === "counted", result });
  } catch (error) {
    const code = typeof error?.code === "string" || typeof error?.code === "number"
      ? String(error.code)
      : "unknown";
    console.error("TRACK VIEW DIAGNOSTIC ERROR:", { stage, code, message: error?.message });
    return NextResponse.json(
      { success: false, stage, error: "Tracking failed", code },
      { status: 500 }
    );
  }
}
