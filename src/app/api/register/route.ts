import { NextResponse } from "next/server";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Recibir JSON del cliente y reenviar al backend
    const bodyText = await req.text();
    const res = await fetch(`${API_V1}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyText,
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `BFF /api/register error: ${err?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}

