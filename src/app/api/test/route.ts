import { NextResponse } from "next/server";
import { API } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const r = await fetch(`${API}/test`, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}
