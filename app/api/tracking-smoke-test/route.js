import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// TEMPORARY PREVIEW-ONLY smoke test. Remove after verification.
const TEST_ID = "tracking-smoke-test-20261025";

function sameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export async function POST(req) {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ success: false, error: "Preview only" }, { status: 404 });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }
  if (!adminDb) {
    return NextResponse.json({ success: false, error: "Tracking unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const ref = adminDb.collection("tracking_smoke_tests").doc(TEST_ID);

    if (body?.action === "write") {
      await ref.set({
        marker: "temporary-admin-write-test",
        createdAt: FieldValue.serverTimestamp(),
      });
      const snap = await ref.get();
      return NextResponse.json({
        success: snap.exists && snap.data()?.marker === "temporary-admin-write-test",
        written: snap.exists,
      });
    }

    if (body?.action === "cleanup") {
      await ref.delete();
      const snap = await ref.get();
      return NextResponse.json({ success: !snap.exists, deleted: !snap.exists });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("TRACKING SMOKE TEST ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
