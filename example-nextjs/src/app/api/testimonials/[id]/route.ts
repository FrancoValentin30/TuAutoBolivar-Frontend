import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";
export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;
  const body = await req.text();

  const common = (path: string) =>
    fetch(`${API_V1}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body,
    });

  let r = await common(`/testimonials/${params.id}`);
  if (r.status === 404 || r.status === 405) r = await common(`/testimonios/${params.id}`);
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;

  const common = (path: string) =>
    fetch(`${API_V1}${path}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  let r = await common(`/testimonials/${params.id}`);
  if (r.status === 404 || r.status === 405) r = await common(`/testimonios/${params.id}`);
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}
