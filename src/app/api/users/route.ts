import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_V1 } from "@/lib/api";
export const runtime = "nodejs";

// Lista de usuarios (admin)
export async function GET(req: Request) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const search = new URL(req.url).search || "";
  const r = await fetch(`${API_V1}/users${search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const j = await r.json().catch(() => ([]));
  return NextResponse.json(j, { status: r.status });
}

// Crear usuario desde el panel admin
// Estrategia: 1) registrar con /register (rol user), 2) si se envió "role" y es distinto de "user",
// intentar PATCH /admin/users/{id}/change-role con el Bearer del admin.
export async function POST(req: Request) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ detail: "Body must be JSON" }, { status: 400 });
  }

  const { name, email, phone, password, role } = payload || {};
  if (!name || !email || !password) {
    return NextResponse.json({ detail: "Campos requeridos: name, email, password" }, { status: 400 });
  }

  // 1) Registrar usuario (rol por defecto: user)
  const regRes = await fetch(`${API_V1}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const regJson = await regRes.json().catch(() => ({}));
  if (!regRes.ok) {
    return NextResponse.json(regJson, { status: regRes.status || 400 });
  }

  // 2) Si se solicitó rol distinto de "user", intentar cambiarlo (solo superadmin podrá lograrlo)
  let finalJson = regJson;
  if (role && role !== "user") {
    // intentar obtener el id del usuario recién creado
    const createdId: number | undefined = regJson?.id_usuario ?? regJson?.id ?? regJson?.user?.id_usuario ?? regJson?.user?.id;
    if (createdId) {
      const changeRes = await fetch(`${API_V1}/admin/users/${createdId}/change-role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_role: role }),
      });
      const changeJson = await changeRes.json().catch(() => ({}));
      if (changeRes.ok) {
        finalJson = changeJson;
      } else {
        // devolver igualmente 201 si el registro fue exitoso, pero adjuntar aviso
        finalJson = { ...regJson, warning: changeJson?.detail || "Usuario creado, pero no se pudo cambiar el rol" };
      }
    } else {
      finalJson = { ...regJson, warning: "Usuario creado, pero no se obtuvo ID para cambiar rol" };
    }
  }

  return NextResponse.json(finalJson, { status: 201 });
}
