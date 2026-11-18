import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldPath, getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECT_ID = "oodlesnet-6c19e";

function json(body, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function getAdminApp() {
  if (process.env.FIREBASE_PROJECT_ID !== PROJECT_ID) throw new Error("Production Firebase project mismatch.");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Firebase Admin credentials are not configured.");
  const name = "oodlesnet-firestore-backup";
  return getApps().find(app => app.name === name) || initializeApp({
    credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }),
    projectId: PROJECT_ID
  }, name);
}

function serialize(value) {
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
  }
  return value;
}

export async function GET(request) {
  let app;
  try {
    app = getAdminApp();
  } catch (error) {
    return json({ ok: false, error: error.message }, 503);
  }

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return json({ ok: false, error: "Firebase ID token required." }, 401);

  const allowlist = (process.env.PRODUCTION_PRODUCT_WRITER_ADMIN_UIDS || "")
    .split(",").map(value => value.trim()).filter(Boolean);
  if (!allowlist.length) return json({ ok: false, error: "Admin UID allowlist is not configured." }, 503);

  let user;
  try {
    user = await getAuth(app).verifyIdToken(header.slice(7), true);
  } catch {
    return json({ ok: false, error: "Invalid or expired Firebase ID token." }, 401);
  }
  if (!allowlist.includes(user.uid)) return json({ ok: false, error: "Admin access required." }, 403);

  try {
    const snapshot = await getFirestore(app).collection("products")
      .orderBy(FieldPath.documentId()).get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, data: serialize(doc.data()) }));
    const payload = {
      ok: true,
      project: PROJECT_ID,
      collection: "products",
      count: documents.length,
      exportedAt: new Date().toISOString(),
      readOnly: true,
      documents
    };
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="oodlesnet-live-products-backup.json"',
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return json({ ok: false, error: "Firestore export failed." }, 500);
  }
}
