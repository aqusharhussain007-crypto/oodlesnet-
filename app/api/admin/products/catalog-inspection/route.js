import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message, status) {
  return NextResponse.json({ ok: false, error: message }, {
    status, headers: { "Cache-Control": "no-store" },
  });
}

function getTestApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (projectId !== "oodlesnet-test") throw new Error("Inspection is locked to oodlesnet-test.");
  if (!clientEmail || !privateKey) throw new Error("Test Firebase Admin credentials are not configured.");
  return getApps().find((app) => app.name === "oodlesnet-test-catalog-inspector") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, "oodlesnet-test-catalog-inspector");
}

export async function GET(request) {
  let app;
  try { app = getTestApp(); } catch (error) {
    return fail(error instanceof Error ? error.message : "Test configuration error.", 503);
  }
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return fail("Firebase ID token required.", 401);
  const allowed = (process.env.TEST_WRITER_ADMIN_UIDS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!allowed.length) return fail("Test admin allowlist is not configured.", 503);
  let uid;
  try {
    const decoded = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowed.includes(decoded.uid)) return fail("Administrator access required.", 403);
    uid = decoded.uid;
  } catch { return fail("Firebase ID token is invalid or expired.", 401); }

  try {
    const snapshot = await getFirestore(app).collection("products").get();
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        documentId: doc.id,
        name: typeof data.name === "string" ? data.name : null,
        brand: typeof data.brand === "string" ? data.brand : null,
        categorySlug: typeof data.categorySlug === "string" ? data.categorySlug : null,
        storeCount: Array.isArray(data.store) ? data.store.length : 0,
        hasSpecs: !!data.specs && typeof data.specs === "object",
      };
    }).sort((a, b) => a.documentId.localeCompare(b.documentId));
    const verificationIds = ["36MaFYdnIalGYYwZhZbq", "wYJ88jdBndp0VqtyE0Tu"];
    const specVerification = verificationIds.map((id) => {
      const doc = snapshot.docs.find((entry) => entry.id === id);
      if (!doc) return { documentId: id, exists: false };
      const data = doc.data();
      const specs = data.specs && typeof data.specs === "object" && !Array.isArray(data.specs) ? data.specs : {};
      return {
        documentId: id,
        exists: true,
        name: data.name || null,
        brand: data.brand || null,
        specCount: Object.keys(specs).length,
        specs,
      };
    });
    return NextResponse.json({
      ok: true,
      project: "oodlesnet-test",
      collection: "products",
      count: products.length,
      inspectedBy: uid,
      products,
      specVerification,
      note: "Read-only inventory and smartphone specification read-back. No records were changed.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Could not read the test products collection.", 500);
  }
}
