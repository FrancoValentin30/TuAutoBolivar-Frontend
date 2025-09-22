import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  // borrar cookie del token
  res.cookies.set("access_token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}

export async function GET() {
  return POST();
}

