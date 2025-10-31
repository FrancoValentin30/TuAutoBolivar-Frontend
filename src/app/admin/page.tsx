"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useDialog } from "@/Componets/DialogProvider";

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
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [pubs, setPubs] = useState<any[]>([]);
  const [pubStatusFilter, setPubStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("pendiente");
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [pubError, setPubError] = useState("");
  const [tests, setTests] = useState<any[]>([]);

  const activeUsersCount = useMemo(
    () => users.filter((u) => u?.activo !== false).length,
    [users],
  );
  const inactiveUsersCount = users.length - activeUsersCount;
  const visibleUsers = useMemo(
    () => (showInactive ? users : users.filter((u) => u?.activo !== false)),
    [users, showInactive],
  );

  const fetchUsers = useCallback(async () => {
    const qs = showInactive ? "?include_inactive=1" : "";
    try {
      const data = await fetchData(`/users${qs}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }, [showInactive]);

  const fetchPendingUsers = useCallback(async () => {
    setLoadingPending(true);
    setPendingError("");
    try {
      const data = await fetchData("/admin/users/pending");
      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPendingUsers([]);
      setPendingError("No se pudieron cargar las solicitudes pendientes.");
    } finally {
      setLoadingPending(false);
    }
  }, []);

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

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const formatStatusLabel = (value?: string | null) => {
    if (!value) return "—";
    const lower = value.toString().toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return (
    <section className="fade-in space-y-8 w-full">
      <h1 className="text-3xl font-extrabold">Panel de Administracion</h1>

      {/* Solicitudes de registro pendientes */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="font-bold text-xl">Solicitudes de registro</h2>
            <p className="text-sm text-gray-500">
              Aprueba o rechaza los usuarios recién registrados antes de que puedan iniciar sesión.
            </p>
          </div>
          <button
            onClick={fetchPendingUsers}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm transition-colors"
          >
            Actualizar lista
          </button>
        </div>
        {pendingError && (
          <p className="text-sm text-red-600 mb-4">{pendingError}</p>
        )}
        {loadingPending ? (
          <p className="text-sm text-gray-500">Cargando solicitudes...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No hay registros pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-striped">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Registrado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingUsers.map((u) => (
                  <tr key={`pending-${u.id_usuario}`}>
                    <td className="px-6 py-3">{u.id_usuario}</td>
                    <td className="px-6 py-3">{u.nombre}</td>
                    <td className="px-6 py-3">{u.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDateTime(u.fecha_registro)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyles(
                          u.estado_registro
                        )}`}
                      >
                        {formatStatusLabel(u.estado_registro)}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex flex-wrap gap-2">
                      <AdminActions.RegistrationReview
                        id={u.id_usuario}
                        onCompleted={() => {
                          fetchPendingUsers();
                          fetchUsers();
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usuarios */}
      <div className="rounded-2xl shadow-xl p-6 bg-white dark:bg-[#0f172a]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-slate-100">Usuarios</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Activos: {activeUsersCount} | Inactivos: {inactiveUsersCount}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm flex items-center gap-2 text-gray-700 dark:text-slate-300">
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

        {visibleUsers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {showInactive ? "No hay usuarios inactivos." : "No hay usuarios activos en este momento."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            {/* border-collapse evita halos y gaps; quitamos table-striped */}
            <table className="min-w-full w-full border-collapse text-gray-900 dark:text-slate-100">
              <thead className="bg-gray-100 dark:bg-slate-800/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Estado registro</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>

              {/* divide en dark debe ser oscuro; forzamos fondo uniforme por fila */}
              <tbody
                className="
                  divide-y divide-gray-200 dark:divide-slate-700
                  [&>tr]:bg-white dark:[&>tr]:bg-[#0f172a]
                "
              >
                {visibleUsers.map((u) => {
                  const userIsActive = u?.activo !== false;
                  return (
                    <tr key={u.id_usuario}>
                      <td className="px-6 py-3">{u.id_usuario}</td>
                      <td className="px-6 py-3">{u.nombre}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                            userIsActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {userIsActive ? "Activo" : "Inactivo"}
                        </span>
                        {(u.roles?.map((r: any) => r.nombre).join(", ")) ?? ""}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyles(u.estado_registro)}`}>
                          {formatStatusLabel(u.estado_registro)}
                        </span>
                        {u.fecha_revision && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Revisado: {formatDateTime(u.fecha_revision)}
                          </p>
                        )}
                        {u.comentario_revision && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            Nota: {u.comentario_revision}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <AdminActions.User
                            id={u.id_usuario}
                            active={userIsActive}
                            estadoRegistro={u.estado_registro}
                            onDeleted={() => {
                              try {
                                setUsers((prev: any[]) => prev.filter((x) => x.id_usuario !== u.id_usuario));
                              } catch {}
                            }}
                            onToggled={() => {
                              try {
                                setUsers((prev: any[]) =>
                                  prev.map((x) =>
                                    x.id_usuario === u.id_usuario
                                      ? {
                                          ...x,
                                          activo: x?.activo !== false ? false : true,
                                        }
                                      : x
                                  )
                                );
                              } catch {}
                            }}
                            onRegistrationUpdated={(updated) => {
                              try {
                                setUsers((prev: any[]) =>
                                  prev.map((x) => (x.id_usuario === u.id_usuario ? { ...x, ...updated } : x))
                                );
                              } catch {}
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
  RegistrationReview: ({
    id,
    onCompleted,
  }: {
    id: number;
    onCompleted?: (result?: any) => void;
  }) => {
    const dialog = useDialog();
    async function review(decision: "aprobar" | "rechazar") {
      let comentario: string | undefined;
      if (decision === "rechazar") {
        const motivo = await dialog.prompt({
          title: "Rechazar solicitud",
          message: "Ingresa el motivo del rechazo.",
          placeholder: "Motivo del rechazo",
          confirmText: "Rechazar",
          variant: "warning",
          required: true,
        });
        if (motivo === null) return;
        comentario = motivo;
      }

      const r = await apiFetch(`/admin/users/${id}/review`, {
        method: "PATCH",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comentario }),
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        await dialog.alert({
          title: "Error",
          message:
            payload?.detail ||
            `No se pudo ${decision === "aprobar" ? "aprobar" : "rechazar"} (HTTP ${r.status})`,
          variant: "error",
        });
        return;
      }
      await dialog.alert({
        title: decision === "aprobar" ? "Usuario aprobado" : "Usuario rechazado",
        message:
          decision === "aprobar"
            ? "Usuario aprobado correctamente."
            : "Usuario rechazado correctamente.",
        variant: decision === "aprobar" ? "success" : "info",
      });
      onCompleted?.(payload);
    }

    return (
      <>
        <button
          onClick={() => review("aprobar")}
          className="px-3 py-1 rounded-lg bg-green-600 text-white"
        >
          Aprobar
        </button>
        <button
          onClick={() => review("rechazar")}
          className="px-3 py-1 rounded-lg bg-red-600 text-white"
        >
          Rechazar
        </button>
      </>
    );
  },

  User: ({
    id,
    active,
    estadoRegistro,
    onDeleted,
    onToggled,
    onRegistrationUpdated,
  }: {
    id: number;
    active: boolean;
    estadoRegistro?: string | null;
    onDeleted?: () => void;
    onToggled?: () => void;
    onRegistrationUpdated?: (user: any) => void;
  }) => {
    const dialog = useDialog();
    const deleteLabel = active ? "Eliminar" : "Eliminar definitivamente";
    async function del() {
      const confirmMsg = active
        ? "Eliminar usuario?"
        : "Eliminar definitivamente este usuario? Esta accion no se puede deshacer.";
      const confirmed = await dialog.confirm({
        title: active ? "Eliminar usuario" : "Eliminar definitivamente",
        message: confirmMsg,
        confirmText: deleteLabel,
        variant: "warning",
      });
      if (!confirmed) return;
      const r = await apiFetch(`/admin/users/${id}`, {
        method: "DELETE",
        auth: true,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        await dialog.alert({
          title: "Error",
          message: j?.detail || `No se pudo eliminar (HTTP ${r.status})`,
          variant: "error",
        });
        return;
      }
      onDeleted?.();
    }
    async function deactivate() {
      const confirmed = await dialog.confirm({
        title: active ? "Desactivar usuario" : "Reactivar usuario",
        message: active
          ? "Desactivar usuario?"
          : "Reactivar usuario?",
        confirmText: active ? "Desactivar" : "Reactivar",
        variant: "warning",
      });
      if (!confirmed) {
        return;
      }
      const r = await apiFetch(`/admin/users/${id}/toggle-status`, {
        method: "PATCH",
        auth: true,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as any));
        await dialog.alert({
          title: "Error",
          message: j?.detail || `No se pudo completar la accion (HTTP ${r.status})`,
          variant: "error",
        });
        return;
      }
      onToggled?.();
    }
    function edit() {
      location.href = `/admin/users/${id}`;
    }

    async function approveRejected() {
      const r = await apiFetch(`/admin/users/${id}/review`, {
        method: "PATCH",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "aprobar" }),
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        await dialog.alert({
          title: "Error",
          message: payload?.detail || `No se pudo aprobar (HTTP ${r.status})`,
          variant: "error",
        });
        return;
      }
      await dialog.alert({
        title: "Usuario aprobado",
        message: "Usuario aprobado correctamente.",
        variant: "success",
      });
      onRegistrationUpdated?.(payload);
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
        {String(estadoRegistro || "").toLowerCase() === "rechazado" && (
          <button
            onClick={approveRejected}
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white"
          >
            Aprobar
          </button>
        )}
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
    const dialog = useDialog();
    const normalized = (estado || "").toLowerCase();

    async function updateStatus(
      target: "Pendiente" | "Activo" | "Rechazado" | "Inactivo",
      confirmMsg?: string,
    ) {
      if (confirmMsg) {
        const confirmed = await dialog.confirm({
          message: confirmMsg,
          confirmText: "Sí, continuar",
          variant: "warning",
        });
        if (!confirmed) return;
      }
      const r = await apiFetch(`/admin/publications/${id}/status`, {
        method: "PATCH",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: target }),
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        await dialog.alert({
          title: "Error",
          message: payload?.detail || `No se pudo actualizar (HTTP ${r.status})`,
          variant: "error",
        });
        return;
      }
      onRefresh?.();
    }

    async function del() {
      const confirmed = await dialog.confirm({
        title: "Eliminar publicación",
        message: "Eliminar publicacion?",
        confirmText: "Eliminar",
        variant: "warning",
      });
      if (!confirmed) return;
      const r = await apiFetch(`/publications/${id}`, {
        method: "DELETE",
        auth: true,
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        await dialog.alert({
          title: "Error",
          message: payload?.detail || `No se pudo eliminar (HTTP ${r.status})`,
          variant: "error",
        });
        return;
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
    const dialog = useDialog();
    async function del() {
      const confirmed = await dialog.confirm({
        title: "Eliminar testimonio",
        message: "Eliminar testimonio?",
        confirmText: "Eliminar",
        variant: "warning",
      });
      if (!confirmed) return;
      const r = await apiFetch(`/testimonials/admin/${id}`, {
        method: "DELETE",
        auth: true,
      });
      const payload = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        await dialog.alert({
          title: "Error",
          message: payload?.detail || `No se pudo eliminar (HTTP ${r.status})`,
          variant: "error",
        });
        return;
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
        await dialog.alert({
          title: "Error",
          message: payload?.detail || `No se pudo aprobar (HTTP ${r.status})`,
          variant: "error",
        });
        return;
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
