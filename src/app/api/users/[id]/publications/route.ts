import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const token = cookies().get("access_token")?.value;
  const r = await fetch(`${API_V1}/users/${params.id}/publications`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
  const j = await r.json().catch(()=> ([]));
  return NextResponse.json(j, { status: r.status });
}
