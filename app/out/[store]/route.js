import { NextResponse } from "next/server";

const AFFILIATE_MAP = {
  amazon: "https://www.amazon.in/",
  flipkart: "https://www.flipkart.com/",
  ajio: "https://www.ajio.com/",
  meesho: "https://www.meesho.com/",
};

export async function GET(req, { params }) {
  const store = params.store?.toLowerCase();
  const targetUrl = AFFILIATE_MAP[store];

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.redirect(targetUrl);
}
