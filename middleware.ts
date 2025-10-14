import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname, search } = request.nextUrl;
  const method = request.method?.toUpperCase?.() || "GET";

  if (method === "OPTIONS" || method === "HEAD") {
    return NextResponse.next();
  }

  const protectedPages = [
    "/publish",
    "/profile",
    "/my-vehicles",
    "/admin",
  ];

  const isProtectedPage =
    protectedPages.includes(pathname) || pathname.startsWith("/admin/");

  if (isProtectedPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/publish",
    "/profile",
    "/my-vehicles",
    "/admin",
    "/admin/:path*",
  ],
};

