import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function PATCH(_: Request, { params }: { params: { id: string; image_id: string } }) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const r = await fetch(`${API_V1}/publications/${params.id}/images/${params.image_id}/set-principal`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const j = await r.json().catch(()=>({}));
  return NextResponse.json(j, { status: r.status });
}

