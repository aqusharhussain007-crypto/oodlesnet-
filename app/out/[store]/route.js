import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Direct redirect (no Firestore here)
  return NextResponse.redirect(targetUrl);
}
