import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const token = cookies().get("access_token")?.value;
  const common = (path: string) =>
    fetch(`${API_V1}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

  // Soporta endpoints en EN y ES
  let r = await common(`/testimonials/approved`);
  if (r.status === 404 || r.status === 405) r = await common(`/testimonios/aprobados`);
  const j = await r.json().catch(() => ([]));
  return NextResponse.json(j, { status: r.status });
}

