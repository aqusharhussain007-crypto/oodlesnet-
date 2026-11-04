import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldPath, getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PROJECT_ID = "oodlesnet-6c19e";
const COLLECTIONS = new Set(["products", "categories"]);

function response(body, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function getApp() {
  if (process.env.FIREBASE_PROJECT_ID !== PROJECT_ID) throw new Error("Production Firebase project mismatch.");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Firebase Admin credentials are not configured.");
  const name = "oodlesnet-firestore-audit";
  return getApps().find(app => app.name === name) || initializeApp({
    credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }), projectId: PROJECT_ID
  }, name);
}
async function requireAdmin(request, app) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return { error: response({ ok: false, error: "Firebase ID token required." }, 401) };
  const allowlist = (process.env.PRODUCTION_PRODUCT_WRITER_ADMIN_UIDS || "").split(",").map(x => x.trim()).filter(Boolean);
  if (!allowlist.length) return { error: response({ ok: false, error: "Admin UID allowlist is not configured." }, 503) };
  try {
    const user = await getAuth(app).verifyIdToken(header.slice(7), true);
    if (!allowlist.includes(user.uid)) return { error: response({ ok: false, error: "Admin access required." }, 403) };
    return { uid: user.uid };
  } catch {
    return { error: response({ ok: false, error: "Invalid or expired Firebase ID token." }, 401) };
  }
}
function serialize(value) {
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, serialize(v)]));
  return value;
}
export async function GET(request) {
  let app;
  try { app = getApp(); } catch (error) { return response({ ok: false, error: error.message }, 503); }
  const auth = await requireAdmin(request, app);
  if (auth.error) return auth.error;
  const params = new URL(request.url).searchParams;
  const collection = params.get("collection") || "";
  const cursor = params.get("cursor") || "";
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") || 50)));
  if (!COLLECTIONS.has(collection)) return response({ ok: false, error: "Only products and categories can be read." }, 400);
  if (cursor && !/^[A-Za-z0-9_-]{1,100}$/.test(cursor)) return response({ ok: false, error: "Invalid cursor." }, 400);
  try {
    const db = getFirestore(app);
    let query = db.collection(collection).orderBy(FieldPath.documentId()).limit(limit + 1);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    const more = snapshot.docs.length > limit;
    const documents = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, data: serialize(doc.data()) }));
    return response({ ok: true, project: PROJECT_ID, collection, count: documents.length, hasMore: more, nextCursor: more ? documents[documents.length - 1].id : null, documents });
  } catch {
    return response({ ok: false, error: "Firestore read failed." }, 500);
  }
}
