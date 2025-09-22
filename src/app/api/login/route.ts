import { NextResponse } from "next/server";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email ?? "";
    const password = body?.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ detail: "Body must be JSON { email, password }" }, { status: 400 });
    }

    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);

    const loginRes = await fetch(`${API_V1}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok || !loginData?.access_token) {
      return NextResponse.json(loginData, { status: loginRes.status || 401 });
    }

    const meRes = await fetch(`${API_V1}/users/me`, {
      headers: { Authorization: `Bearer ${loginData.access_token}` },
      cache: "no-store",
    });
    const meData = await meRes.json().catch(() => ({}));

    // armamos la respuesta
    const unified = meRes.ok
      ? { ...meData, access_token: loginData.access_token, token_type: loginData.token_type }
      : loginData;

    // seteamos cookie httpOnly con el token
    const res = NextResponse.json(unified, { status: 200 });
    const maxAge = 60 * 60 * 4; // 4h
    res.cookies.set("access_token", loginData.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // ponelo en true si desplegás con https
      path: "/",
      maxAge,
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ detail: `BFF /api/login error: ${err?.message ?? "unknown"}` }, { status: 500 });
  }
}
