import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";
export const runtime = "nodejs";

async function forwardGET(token?: string) {
  const common = (path: string) =>
    fetch(`${API_V1}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

  let r = await common("/testimonials");
  if (r.status === 404 || r.status === 405) r = await common("/testimonios"); // fallback ES
  const j = await r.json().catch(() => ([]));
  return NextResponse.json(j, { status: r.status });
}

async function forwardPOST(bodyText: string, token?: string) {
  const common = (path: string) =>
    fetch(`${API_V1}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: bodyText,
    });

  let r = await common("/testimonials");
  if (r.status === 404 || r.status === 405) r = await common("/testimonios");
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}

export async function GET() {
  const token = cookies().get("access_token")?.value;
  return forwardGET(token);
}

export async function POST(req: Request) {
  const token = cookies().get("access_token")?.value;
  const body = await req.text();
  return forwardPOST(body, token);
}
