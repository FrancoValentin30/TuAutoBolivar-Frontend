import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Público: permite sin cookie y agrega Bearer si está presente
  const token = cookies().get("access_token")?.value;
  const url = new URL(req.url);
  const search = url.search || ""; // reenvía cualquier query (?q=, ?marca=, etc.)
  const r = await fetch(`${API_V1}/publications${search}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
  const j = await r.json().catch(() => ([]));
  return NextResponse.json(j, { status: r.status });
}

// opcional: crear publicación sin imágenes (si lo usás).
export async function POST(req: Request) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.text();
  const r = await fetch(`${API_V1}/publications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body,
  });
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}
