import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT for Vercel stability

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get("url");

    // Absolute safety check
    if (
      !targetUrl ||
      typeof targetUrl !== "string" ||
      !/^https?:\/\//i.test(targetUrl)
    ) {
      return NextResponse.redirect(new URL("/", url.origin), 302);
    }

    return NextResponse.redirect(targetUrl, 302);
  } catch (err) {
    // Never allow Vercel to throw
    return NextResponse.redirect(new URL("/", "https://example.com"), 302);
  }
}
