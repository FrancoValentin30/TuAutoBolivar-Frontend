import { NextRequest, NextResponse } from "next/server";

// Protege páginas y APIs que requieren cookie `access_token`
export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname, search } = request.nextUrl;
  const method = request.method?.toUpperCase?.() || "GET";

  // Permitir preflight y HEAD sin chequeo
  if (method === "OPTIONS" || method === "HEAD") {
    return NextResponse.next();
  }

  // Detección de rutas API a proteger
  const isApi = pathname.startsWith("/api/");
  const isUsersApi = pathname.startsWith("/api/users");
  const isTestimonialsAdminApi = pathname.startsWith("/api/testimonials/admin");
  const isUploadApi = pathname === "/api/publications/upload";
  const isPublicationsApi = pathname.startsWith("/api/publications/"); // ojo: detalle por método

  // Páginas protegidas
  const isProtectedPage = [
    "/publish",
    "/profile",
    "/my-vehicles",
  ].some((p) => pathname === p) || pathname === "/admin" || pathname.startsWith("/admin/");

  // APIs protegidas (usuarios, admin testimonios, upload, y publicaciones no-GET)
  const isProtectedApi =
    isUsersApi ||
    isTestimonialsAdminApi ||
    isUploadApi ||
    (isPublicationsApi && method !== "GET");

  // Si es página protegida y no hay token -> redirigir al login
  if (isProtectedPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Si es API protegida y no hay token -> 401 JSON
  if (isApi && isProtectedApi && !token) {
    return new NextResponse(
      JSON.stringify({ detail: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.next();
}

// Aplicar a páginas protegidas y a BFFs que necesitan sesión
export const config = {
  matcher: [
    // pages
    "/publish",
    "/profile",
    "/my-vehicles",
    "/admin",
    "/admin/:path*",
    // apis específicas
    "/api/users/:path*",
    "/api/testimonials/admin/:path*",
    "/api/publications/upload",
    "/api/publications/:path*",
  ],
};
