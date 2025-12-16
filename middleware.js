import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ignore files and API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  // If no locale in path → redirect to /en
  if (!pathname.startsWith("/en") && !pathname.startsWith("/hi")) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
    
