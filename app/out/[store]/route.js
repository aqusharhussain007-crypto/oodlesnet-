import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.redirect(decodeURIComponent(targetUrl), 302);
}
