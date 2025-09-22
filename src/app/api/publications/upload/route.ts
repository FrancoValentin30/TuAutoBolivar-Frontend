import { NextResponse } from "next/server";
import { API_V1 } from "@/lib/api";
import { cookies } from "next/headers";

export const runtime = "nodejs"; // importante

export async function POST(req: Request) {
  try {
    const incoming = await req.formData(); // NO setear Content-Type manualmente
    const token = cookies().get("access_token")?.value;

    const publicationData = incoming.get("publication_data");
    const imgs = incoming.getAll("images");

    if (typeof publicationData !== "string") {
      return NextResponse.json({ detail: "Falta 'publication_data' o no es string" }, { status: 400 });
    }
    if (!imgs || imgs.length === 0) {
      return NextResponse.json({ detail: "Debes adjuntar al menos 1 imagen" }, { status: 400 });
    }

    // Reempaquetar con FormData del runtime para mayor compatibilidad
    const forward = new FormData();
    forward.set("publication_data", publicationData);
    for (const f of imgs) {
      const file = f as unknown as File;
      const name = (file as any)?.name || "upload.jpg";
      // Crear un Blob sin tipo explícito para evitar el chequeo buggy de content_type
      const buf = await file.arrayBuffer().catch(() => null);
      const blob = buf ? new Blob([buf]) : new Blob([file]);
      // @ts-ignore - undici soporta Blob + filename
      forward.append("images", blob, name);
    }

    const r = await fetch(`${API_V1}/publications`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: forward,
    });
    const j = await r.json().catch(() => ({ detail: "Error al parsear respuesta" }));
    return NextResponse.json(j, { status: r.status });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Error en upload" }, { status: 500 });
  }
}
