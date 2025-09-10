import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const r = await fetch(`${API_V1}/publications/${params.id}`, { cache: "no-store" });
  const j = await r.json().catch(()=> ({}));
  return NextResponse.json(j, { status: r.status });
}

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.text();
  const r = await fetch(`${API_V1}/publications/${params.id}`, {
    method: "PUT",
    headers:{ "Content-Type":"application/json", Authorization: `Bearer ${token}` },
    body,
  });
  const j = await r.json().catch(()=> ({}));
  return NextResponse.json(j, { status: r.status });
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const r = await fetch(`${API_V1}/publications/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json().catch(()=> ({}));
  return NextResponse.json(j, { status: r.status });
}
