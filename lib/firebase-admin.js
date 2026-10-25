import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin is server-only. If credentials are absent or malformed,
 * export null so callers can fail gracefully rather than crashing on import.
 */
function normalizePrivateKey(raw) {
  let key = String(raw || "").trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function createAdminApp() {
  try {
    const existing = getApps();
    if (existing.length) return existing[0];

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin not configured: one or more FIREBASE_* variables are missing.");
      return null;
    }

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: normalizePrivateKey(privateKey) }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error?.message || "unknown error");
    return null;
  }
}

const adminApp = createAdminApp();
export const adminDb = adminApp ? getFirestore(adminApp) : null;
