import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export async function GET() {
  await db.collection("verification_test").add({
    message: "Firebase Admin write successful",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    ok: true,
    message: "Verification write completed",
  });
}
