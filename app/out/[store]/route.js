import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { store } = params;
  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("pid");
  const targetUrl = searchParams.get("url");

  if (!productId || !store || !targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ ALWAYS redirect first (never fail)
  const decodedUrl = decodeURIComponent(targetUrl);
  const response = NextResponse.redirect(decodedUrl, 302);

  // 🔒 TEMPORARILY DISABLED (prevents Vercel crash)
  // Tracking will be re-enabled safely after confirmation

  return response;
}
