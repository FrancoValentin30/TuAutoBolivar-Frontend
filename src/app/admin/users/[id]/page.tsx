"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type AdminUser = {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  roles?: { nombre: string }[];
};

export default function AdminEditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [u, setU] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin" | "superadmin" | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const isSuper = me?.role === "superadmin";

  useEffect(() => {
    async function load() {
      setLoading(true); setError("");
      try {
        const r = await fetch(`/api/users?include_inactive=1`, { credentials: "include" });
        if (!r.ok) throw new Error(`No se pudo cargar usuarios (${r.status})`);
        const list: AdminUser[] = await r.json();
        const found = list.find(x => String(x.id_usuario) === String(id));
        if (!found) throw new Error("Usuario no encontrado");
        setU(found);
        setName(found.nombre || "");
        setEmail(found.email || "");
        setPhone(found.telefono || "");
        const mainRole = found.roles?.[0]?.nombre || "user";
        setRole((mainRole as any) || "user");
      } catch (e: any) {
        setError(e?.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function save() {
    if (!u) return;
    setError("");
    try {
      const payload: any = { name, email, phone };
      if (password) payload.password = password;

      // PUT datos base
      const r1 = await fetch(`/api/users/${u.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r1.ok) {
        const j = await r1.json().catch(() => ({}));
        throw new Error(j?.detail || `No se pudo guardar (HTTP ${r1.status})`);
      }

      // Cambio de rol solo si superadmin y no superadmin destino
      const currentMainRole = u.roles?.[0]?.nombre || "user";
      if (isSuper && role && role !== currentMainRole) {
        const r2 = await fetch(`/api/users/${u.id_usuario}/change-role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ new_role: role }),
        });
        if (!r2.ok) {
          const j = await r2.json().catch(() => ({}));
          throw new Error(j?.detail || `No se pudo cambiar el rol (HTTP ${r2.status})`);
        }
      }

      alert("Cambios guardados");
      router.push("/admin");
    } catch (e: any) {
      setError(e?.message || "Error al guardar");
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!u) return <div className="p-6">Usuario no encontrado</div>;

  return (
    <main className="fade-in max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
      <h1 className="text-2xl font-extrabold mb-4">Editar Usuario #{u.id_usuario}</h1>

      {!u.activo && (
        <div className="mb-4 text-sm text-yellow-800 bg-yellow-100 px-3 py-2 rounded-lg">
          Este usuario está inactivo.
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input className="w-full border rounded-lg px-4 py-2" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input type="email" className="w-full border rounded-lg px-4 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Teléfono</label>
          <input className="w-full border rounded-lg px-4 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Nueva contraseña (opcional)</label>
          <input type="password" className="w-full border rounded-lg px-4 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {isSuper && (
          <div>
            <label className="block text-sm font-semibold mb-1">Rol</label>
            <select className="w-full border rounded-lg px-4 py-2" value={role} onChange={e=>setRole(e.target.value as any)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Solo superadmin puede cambiar roles. No se puede asignar superadmin desde aquí.</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={save} className="btn-primary text-white px-4 py-2 rounded-xl">Guardar</button>
          <button onClick={()=>router.push("/admin")} className="px-4 py-2 rounded-xl border">Cancelar</button>
        </div>
      </div>
    </main>
  );
}

