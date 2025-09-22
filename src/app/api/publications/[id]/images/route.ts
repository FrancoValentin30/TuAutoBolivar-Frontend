import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get("access_token")?.value;
    const incoming = await req.formData();
    const imgs = incoming.getAll("images");
    if (!imgs || imgs.length === 0) {
      return NextResponse.json({ detail: "Debes adjuntar al menos 1 imagen" }, { status: 400 });
    }

    const forward = new FormData();
    for (const f of imgs) {
      const file = f as unknown as File;
      const buf = await file.arrayBuffer().catch(() => null);
      const blob = buf ? new Blob([buf]) : new Blob([file]);
      // @ts-ignore undici soporta filename
      forward.append("images", blob, (file as any)?.name || "upload.jpg");
    }

    const r = await fetch(`${API_V1}/publications/${params.id}/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: forward,
    });
    const j = await r.json().catch(() => ({}));
    return NextResponse.json(j, { status: r.status });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Error al subir imágenes" }, { status: 500 });
  }
}

