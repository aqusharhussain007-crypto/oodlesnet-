import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getTestApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (projectId !== "oodlesnet-test") throw new Error("Comparison catalogue is locked to oodlesnet-test.");
  if (!clientEmail || !privateKey) throw new Error("Test Firebase Admin credentials are not configured.");
  return getApps().find((app) => app.name === "oodlesnet-test-compare-reader") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, "oodlesnet-test-compare-reader");
}

export async function GET(request) {
  let app;
  try { app = getTestApp(); } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Test configuration error." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return NextResponse.json({ ok: false, error: "Firebase ID token required." }, { status: 401 });
  const allowlist = (process.env.TEST_WRITER_ADMIN_UIDS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!allowlist.length) return NextResponse.json({ ok: false, error: "Test admin allowlist is not configured." }, { status: 503 });
  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(decoded.uid)) return NextResponse.json({ ok: false, error: "Administrator access required." }, { status: 403 });
  } catch {
    return NextResponse.json({ ok: false, error: "Firebase ID token is invalid or expired." }, { status: 401 });
  }
  try {
    const snapshot = await getFirestore(app).collection("products").get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, project: "oodlesnet-test", count: products.length, products, readOnly: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not read test products." }, { status: 500 });
  }
}
