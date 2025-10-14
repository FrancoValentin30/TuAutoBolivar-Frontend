// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

async function fetchData(path: string) {
  const res = await apiFetch(path, { auth: true });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [pubs, setPubs] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    const qs = showInactive ? "?include_inactive=1" : "";
    Promise.all([
      fetchData(`/users${qs}`).catch(() => []),
      fetchData("/publications").catch(() => []),
      fetchData("/testimonials/admin").catch(() => []),
    ]).then(([u, p, t]) => {
      setUsers(u);
      setPubs(p);
      setTests(t);
    });
  }, [showInactive]);

  return (
    <section className="fade-in space-y-8 w-full">
      <h1 className="text-3xl font-extrabold">Panel de Administración</h1>

      {/* Usuarios */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">Usuarios</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={showInactive} onChange={(e)=>setShowInactive(e.target.checked)} />
              Mostrar inactivos
            </label>
            <Link
            href="/admin/users/new"
            className="btn-primary text-white px-4 py-2 rounded-xl"
          >
            Nuevo usuario
          </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-striped">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-bold">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold">Rol</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id_usuario}>
                  <td className="px-6 py-3">{u.id_usuario}</td>
                  <td className="px-6 py-3">{u.nombre}</td>
                  <td className="px-6 py-3">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${u.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                    {(u.roles?.map((r: any) => r.nombre).join(", ")) ?? ""}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <AdminActions.User
                      id={u.id_usuario}
                      active={u.activo}
                      onDeleted={() => {
                        try { setUsers((prev:any[]) => prev.filter(x => x.id_usuario !== u.id_usuario)); } catch {}
                      }}
                      onToggled={() => {
                        try { setUsers((prev:any[]) => prev.map(x => x.id_usuario === u.id_usuario ? { ...x, activo: !x.activo } : x)); } catch {}
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publicaciones */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">Publicaciones</h2>
          <Link
            href="/admin/publications/new"
            className="btn-primary text-white px-4 py-2 rounded-xl"
          >
            Nueva publicación
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-striped">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-bold">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-bold">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pubs.map((p) => (
                <tr key={p.id_publicacion}>
                  <td className="px-6 py-3">{p.id_publicacion}</td>
                  <td className="px-6 py-3">
                    {p?.vehiculo?.marca} {p?.vehiculo?.modelo} {p?.vehiculo?.año}
                  </td>
                  <td className="px-6 py-3">
                    ${(p.precio ?? 0).toLocaleString("es-AR")} USD
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <AdminActions.Publication
                      id={p.id_publicacion}
                      onDeleted={() => {
                        try { setPubs((prev:any[]) => prev.filter(x => x.id_publicacion !== p.id_publicacion)); } catch {}
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonios */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-6 border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">Testimonios</h2>
        </div>
        <div className="space-y-3">
          {tests.length === 0 ? (
            <p className="text-gray-600">No hay testimonios.</p>
          ) : (
            tests.map((t) => (
              <div
                key={t.id_testimonio}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex items-start justify-between gap-4 bg-white dark:bg-[#0f172a] hover:shadow-md transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold">{t.autor_nombre || "Anónimo"}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.aprobado ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-300/40" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border border-yellow-300/40"}`}>
                      {t.aprobado ? "Aprobado" : "Pendiente"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => { try { return new Date(t.fecha).toLocaleString("es-AR"); } catch { return ""; } })()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{t.contenido}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {!t.aprobado && (
                    <AdminActions.Testimonial id={t.id_testimonio} onDone={() => {
                      // quitar del listado al aprobar
                      try { setTests((prev:any[]) => prev.filter(x => x.id_testimonio !== t.id_testimonio)); } catch {}
                    }} mode="approve" />
                  )}
                  <AdminActions.Testimonial id={t.id_testimonio} onDone={() => {
                    // quitar del listado al eliminar
                    try { setTests((prev:any[]) => prev.filter(x => x.id_testimonio !== t.id_testimonio)); } catch {}
                  }} mode="delete" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

const AdminActions = {
  User: ({ id, active, onDeleted, onToggled }: { id: number; active: boolean; onDeleted?: () => void; onToggled?: () => void }) => {
    const deleteLabel = active ? "Eliminar" : "Eliminar definitivamente";
    async function del() {
      const confirmMsg = active
        ? "¿Eliminar usuario?"
        : "¿Eliminar definitivamente este usuario? Esta acción no se puede deshacer.";
      if (!confirm(confirmMsg)) return;
      const r = await apiFetch(`/admin/users/${id}`, { method: "DELETE", auth: true });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(j?.detail || `No se pudo eliminar (HTTP ${r.status})`);
      }
      onDeleted?.();
    }
    async function deactivate() {
      if (!confirm(active ? "¿Desactivar usuario?" : "¿Reactivar usuario?")) return;
      const r = await apiFetch(`/admin/users/${id}/toggle-status`, { method: "PATCH", auth: true });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(j?.detail || `No se pudo completar la acción (HTTP ${r.status})`);
      }
      onToggled?.();
    }
    function edit() { location.href = `/admin/users/${id}`; }

    return (
      <>
        <button onClick={edit} className="px-3 py-1 rounded-lg bg-blue-600 text-white">Editar</button>
        <button onClick={deactivate} className="px-3 py-1 rounded-lg bg-yellow-500 text-white">
          {active ? "Desactivar" : "Activar"}
        </button>
        <button onClick={del} className="px-3 py-1 rounded-lg bg-red-600 text-white">{deleteLabel}</button>
      </>
    );
  },

  Publication: ({ id, onDeleted }: { id: number; onDeleted?: () => void }) => {
    async function del() {
      if (!confirm("¿Eliminar publicación?")) return;
      const r = await apiFetch(`/publications/${id}`, { method: "DELETE", auth: true });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(j?.detail || `No se pudo eliminar (HTTP ${r.status})`);
      }
      onDeleted?.();
    }
    function edit() { location.href = `/admin/publications/${id}`; }

    return (
      <>
        <button onClick={edit} className="px-3 py-1 rounded-lg bg-blue-600 text-white">Editar</button>
        <button onClick={del} className="px-3 py-1 rounded-lg bg-red-600 text-white">Eliminar</button>
      </>
    );
  },

  Testimonial: ({ id, onDone, mode = "delete" }: { id: number; onDone?: () => void; mode?: "delete" | "approve" }) => {
    async function del() {
      if (!confirm("¿Eliminar testimonio?")) return;
      const r = await apiFetch(`/testimonials/admin/${id}`, { method: "DELETE", auth: true });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(j?.detail || `No se pudo eliminar (HTTP ${r.status})`);
      }
      onDone?.();
    }
    async function approve() {
      const r = await apiFetch(`/testimonials/admin/${id}/approve`, { method: "PATCH", auth: true });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(j?.detail || `No se pudo aprobar (HTTP ${r.status})`);
      }
      onDone?.();
    }
    if (mode === "approve") {
      return (
        <button onClick={approve} className="px-3 py-1 rounded-lg bg-green-600 text-white">Aprobar</button>
      );
    }
    return (
      <button onClick={del} className="px-3 py-1 rounded-lg bg-red-600 text-white">Eliminar</button>
    );
  },
};
