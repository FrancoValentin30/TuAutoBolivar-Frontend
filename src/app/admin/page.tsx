"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

async function fetchData(path: string) {
  const res = await apiFetch(path, { auth: true });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendientes" },
  { value: "activo", label: "Aprobadas" },
  { value: "rechazado", label: "Rechazadas" },
  { value: "inactivo", label: "Inactivas" },
  { value: "todos", label: "Todas" },
] as const;

const getStatusStyles = (estado?: string) => {
  switch ((estado || "").toLowerCase()) {
    case "activo":
      return "bg-green-100 text-green-700";
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "rechazado":
      return "bg-red-100 text-red-700";
    case "inactivo":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [pubs, setPubs] = useState<any[]>([]);
  const [pubStatusFilter, setPubStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("pendiente");
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [pubError, setPubError] = useState("");
  const [tests, setTests] = useState<any[]>([]);

  const fetchUsers = useCallback(async () => {
    const qs = showInactive ? "?include_inactive=1" : "";
    try {
      const data = await fetchData(`/users${qs}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }, [showInactive]);

  const fetchPublications = useCallback(async () => {
    setLoadingPubs(true);
    setPubError("");
    const params = new URLSearchParams();
    if (pubStatusFilter !== "todos") {
      params.set("estado", pubStatusFilter);
    }
    const path = params.toString()
      ? `/admin/publications?${params.toString()}`
      : "/admin/publications";
    try {
      const list = await fetchData(path);
      setPubs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setPubError("No se pudieron cargar las publicaciones.");
      setPubs([]);
    } finally {
      setLoadingPubs(false);
    }
  }, [pubStatusFilter]);

  const fetchTestimonials = useCallback(async () => {
    try {
      const data = await fetchData("/testimonials/admin");
      setTests(Array.isArray(data) ? data : []);
    } catch {
      setTests([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return (
    <section className="fade-in space-y-8 w-full">
      <h1 className="text-3xl font-extrabold">Panel de Administracion</h1>

      {/* Usuarios */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">Usuarios</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
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
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                        u.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                    {(u.roles?.map((r: any) => r.nombre).join(", ")) ?? ""}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <AdminActions.User
                      id={u.id_usuario}
                      active={u.activo}
                      onDeleted={() => {
                        try {
                          setUsers((prev: any[]) =>
                            prev.filter((x) => x.id_usuario !== u.id_usuario)
                          );
                        } catch {
                          /* noop */
                        }
                      }}
                      onToggled={() => {
                        try {
                          setUsers((prev: any[]) =>
                            prev.map((x) =>
                              x.id_usuario === u.id_usuario
                                ? { ...x, activo: !x.activo }
                                : x
                            )
                          );
                        } catch {
                          /* noop */
                        }
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="font-bold text-xl">Publicaciones</h2>
            <p className="text-sm text-gray-500">
              Aprueba, rechaza o desactiva avisos antes de mostrarlos en el
              catalogo.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={pubStatusFilter}
              onChange={(e) =>
                setPubStatusFilter(
                  e.target.value as (typeof STATUS_OPTIONS)[number]["value"]
                )
              }
              className="border px-3 py-2 rounded-xl text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Link
              href="/admin/publications/new"
              className="btn-primary text-white px-4 py-2 rounded-xl text-sm sm:text-base"
            >
              Nueva publicacion
            </Link>
          </div>
        </div>

        {pubError && (
          <div className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {pubError}
          </div>
        )}

        {loadingPubs ? (
          <p className="text-sm text-gray-500">Cargando publicaciones...</p>
        ) : pubs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay publicaciones para el estado seleccionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-striped">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">
                    Vehiculo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold">
                    Estado
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pubs.map((p) => {
                  const year =
                    p?.vehiculo?.["a\u00f1o"] ??
                    p?.vehiculo?.ano ??
                    p?.vehiculo?.anio;
                  return (
                    <tr key={p.id_publicacion}>
                      <td className="px-6 py-3">{p.id_publicacion}</td>
                      <td className="px-6 py-3">
                        {p?.vehiculo?.marca} {p?.vehiculo?.modelo}{" "}
                        {year ?? ""}
                      </td>
                      <td className="px-6 py-3">
                        {p?.propietario?.email ||
                          p?.propietario?.nombre ||
                          "Sin datos"}
                      </td>
                      <td className="px-6 py-3">
                        ${(p.precio ?? 0).toLocaleString("es-AR")} USD
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusStyles(
                            p.estado
                          )}`}
                        >
                          {p.estado || "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex flex-wrap gap-2">
                        <AdminActions.Publication
                          id={p.id_publicacion}
                          estado={p.estado}
                          onRefresh={fetchPublications}
                          onDeleted={() => {
                            try {
                              setPubs((prev: any[]) =>
                                prev.filter(
                                  (x) => x.id_publicacion !== p.id_publicacion
                                )
                              );
                            } catch {
                              /* noop */
                            }
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] p-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{t.autor || "Anonimo"}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.aprobado
                          ? "bg-emerald-100 text-emerald-700 dark:bg-green-900/40 dark:text-green-300 border border-green-300/40"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border border-yellow-300/40"
                      }`}
                    >
                      {t.aprobado ? "Aprobado" : "Pendiente"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        try {
                          return new Date(t.fecha).toLocaleString("es-AR");
                        } catch {
                          return "";
                        }
                      })()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t.contenido}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {!t.aprobado && (
                    <AdminActions.Testimonial
                      id={t.id_testimonio}
                      onDone={() => {
                        try {
                          setTests((prev: any[]) =>
                            prev.filter(
                              (x) => x.id_testimonio !== t.id_testimonio
                            )
                          );
                        } catch {
                          /* noop */
                        }
                      }}
                      mode="approve"
                    />
                  )}
                  <AdminActions.Testimonial
                    id={t.id_testimonio}
                    onDone={() => {
                      try {
                        setTests((prev: any[]) =>
                          prev.filter((x) => x.id_testimonio !== t.id_testimonio)
                        );
                      } catch {
                        /* noop */
                      }
                    }}
                    mode="delete"
                  />
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
  User: ({
    id,
    active,
    onDeleted,
    onToggled,
  }: {
    id: number;
    active: boolean;
    onDeleted?: () => void;
    onToggled?: () => void;
  }) => {
    const deleteLabel = active ? "Eliminar" : "Eliminar definitivamente";
    async function del() {
      const confirmMsg = active
        ? "Eliminar usuario?"
        : "Eliminar definitivamente este usuario? Esta accion no se puede deshacer.";
      if (!confirm(confirmMsg)) return;
      const r = await apiFetch(`/admin/users/${id}`, {
        method: "DELETE",
        auth: true,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(j?.detail || `No se pudo eliminar (HTTP ${r.status})`);
      }
      onDeleted?.();
    }
    async function deactivate() {
      if (!confirm(active ? "Desactivar usuario?" : "Reactivar usuario?")) {
        return;
      }
      const r = await apiFetch(`/admin/users/${id}/toggle-status`, {
        method: "PATCH",
        auth: true,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        return alert(
          j?.detail || `No se pudo completar la accion (HTTP ${r.status})`,
        );
      }
      onToggled?.();
    }
    function edit() {
      location.href = `/admin/users/${id}`;
    }

    return (
      <>
        <button
          onClick={edit}
          className="px-3 py-1 rounded-lg bg-blue-600 text-white"
        >
          Editar
        </button>
        <button
          onClick={deactivate}
          className="px-3 py-1 rounded-lg bg-yellow-500 text-white"
        >
          {active ? "Desactivar" : "Activar"}
        </button>
        <button
          onClick={del}
          className="px-3 py-1 rounded-lg bg-red-600 text-white"
        >
          {deleteLabel}
        </button>
      </>
    );
  },

  Publication: ({
    id,
    estado,
    onDeleted,
    onRefresh,
  }: {
    id: number;
    estado?: string;
    onDeleted?: () => void;
    onRefresh?: () => void;
  }) => {
    const normalized = (estado || "").toLowerCase();

    async function updateStatus(
      target: "Pendiente" | "Activo" | "Rechazado" | "Inactivo",
      confirmMsg?: string,
    ) {
      if (confirmMsg && !confirm(confirmMsg)) return;
      const r = await apiFetch(`/admin/publications/${id}/status`, {
        method: "PATCH",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: target }),
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        return alert(
          payload?.detail || `No se pudo actualizar (HTTP ${r.status})`,
        );
      }
      onRefresh?.();
    }

    async function del() {
      if (!confirm("Eliminar publicacion?")) return;
      const r = await apiFetch(`/publications/${id}`, {
        method: "DELETE",
        auth: true,
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        return alert(
          payload?.detail || `No se pudo eliminar (HTTP ${r.status})`,
        );
      }
      onDeleted?.();
      onRefresh?.();
    }

    function edit() {
      location.href = `/admin/publications/${id}`;
    }

    return (
      <>
        {normalized === "pendiente" && (
          <>
            <button
              onClick={() => updateStatus("Activo", "Aprobar esta publicacion?")}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white"
            >
              Aprobar
            </button>
            <button
              onClick={() =>
                updateStatus("Rechazado", "Rechazar esta publicacion?")
              }
              className="px-3 py-1 rounded-lg bg-red-600 text-white"
            >
              Rechazar
            </button>
          </>
        )}
        {normalized === "rechazado" && (
          <button
            onClick={() => updateStatus("Pendiente")}
            className="px-3 py-1 rounded-lg bg-yellow-500 text-white"
          >
            Reabrir
          </button>
        )}
        {normalized === "activo" && (
          <button
            onClick={() => updateStatus("Inactivo", "Ocultar esta publicacion?")}
            className="px-3 py-1 rounded-lg bg-gray-600 text-white"
          >
            Ocultar
          </button>
        )}
        {normalized === "inactivo" && (
          <button
            onClick={() => updateStatus("Activo")}
            className="px-3 py-1 rounded-lg bg-green-600 text-white"
          >
            Activar
          </button>
        )}
        <button
          onClick={edit}
          className="px-3 py-1 rounded-lg bg-blue-600 text-white"
        >
          Editar
        </button>
        <button
          onClick={del}
          className="px-3 py-1 rounded-lg bg-red-600 text-white"
        >
          Eliminar
        </button>
      </>
    );
  },

  Testimonial: ({
    id,
    onDone,
    mode = "delete",
  }: {
    id: number;
    onDone?: () => void;
    mode?: "delete" | "approve";
  }) => {
    async function del() {
      if (!confirm("Eliminar testimonio?")) return;
      const r = await apiFetch(`/testimonials/admin/${id}`, {
        method: "DELETE",
        auth: true,
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        return alert(
          payload?.detail || `No se pudo eliminar (HTTP ${r.status})`,
        );
      }
      onDone?.();
    }
    async function approve() {
      const r = await apiFetch(`/testimonials/admin/${id}/approve`, {
        method: "PATCH",
        auth: true,
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        return alert(
          payload?.detail || `No se pudo aprobar (HTTP ${r.status})`,
        );
      }
      onDone?.();
    }
    if (mode === "approve") {
      return (
        <button
          onClick={approve}
          className="px-3 py-1 rounded-lg bg-emerald-600 text-white"
        >
          Aprobar
        </button>
      );
    }
    return (
      <button
        onClick={del}
        className="px-3 py-1 rounded-lg bg-red-600 text-white"
      >
        Eliminar
      </button>
    );
  },
};
