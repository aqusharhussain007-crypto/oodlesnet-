import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
  const adminUids = process.env.TEST_WRITER_ADMIN_UIDS || "";

  return NextResponse.json({
    ok: true,
    service: "test-firestore-writer-env-diagnostic",
    diagnostics: {
      configuredProjectMatchesTest: projectId === "oodlesnet-test",
      clientEmailConfigured: clientEmail.trim().length > 0,
      privateKeyConfigured: privateKey.trim().length > 0,
      adminAllowlistConfigured: adminUids.trim().length > 0,
    },
    note: "Boolean checks only; no credentials or product data are returned.",
  });
}
