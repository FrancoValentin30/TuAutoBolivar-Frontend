import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";
export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const payload = await req.text();
  const r = await fetch(`${API_V1}/admin/users/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: payload,
  });
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const r = await fetch(`${API_V1}/admin/users/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}
