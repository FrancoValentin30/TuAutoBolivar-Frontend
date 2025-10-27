"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const getBadgeStyles = (estado?: string) => {
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

export default function MyVehiclesPage() {
  const [pubs, setPubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) throw new Error("Debes iniciar sesion");
        const user = JSON.parse(raw);
        const response = await apiFetch(`/users/${user.id}/publications`, {
          auth: true,
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setPubs(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar tus publicaciones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <main className="p-6">Cargando...</main>;

  return (
    <main className="fade-in p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Mis Vehiculos</h1>
      {error && (
        <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-2">
          {error}
        </div>
      )}
      {pubs.length === 0 ? (
        <p className="text-gray-600">
          Aun no tenes publicaciones.{" "}
          <a className="text-blue-600 underline" href="/publish">
            Publica una
          </a>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubs.map((p: any) => {
            const status: string = p?.estado || "Pendiente";
            const statusLower = status.toLowerCase();
            const year =
              p?.vehiculo?.["a\u00f1o"] ??
              p?.vehiculo?.ano ??
              p?.vehiculo?.anio ??
              "";

            return (
              <div
                key={p.id_publicacion}
                className="bg-white shadow rounded-2xl overflow-hidden hover:shadow-lg transition"
              >
                <a href={`/vehicle/${p.id_publicacion}`} className="block">
                  <img
                    src={
                      p.imagenes?.length
                        ? `${(process.env.NEXT_PUBLIC_API_URL || "").replace(
                            /\/api\/v1\/?$/,
                            ""
                          )}/${p.imagenes[0].url_imagen}`
                        : "/car-placeholder.png"
                    }
                    alt="Vehiculo"
                    className="w-full h-48 object-cover"
                  />
                </a>
                <div className="p-4">
                  <h3 className="font-bold text-lg">
                    {p.vehiculo?.marca} {p.vehiculo?.modelo} {year}
                  </h3>
                  <p className="text-gray-600">
                    {(p.precio || 0).toLocaleString("es-AR")} USD
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${getBadgeStyles(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                  {statusLower === "pendiente" && (
                    <p className="text-sm text-yellow-600 mt-2">
                      En revision. Te avisaremos cuando este aprobada.
                    </p>
                  )}
                  {statusLower === "rechazado" && (
                    <p className="text-sm text-red-600 mt-2">
                      Publicacion rechazada. Editala y guardala para reenviarla
                      a revision.
                    </p>
                  )}
                  {statusLower === "inactivo" && (
                    <p className="text-sm text-gray-500 mt-2">
                      Publicacion oculta. Contacta al equipo de soporte si
                      necesitas ayuda.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <a
                      href={`/my-vehicles/${p.id_publicacion}/edit`}
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm"
                    >
                      Editar
                    </a>
                    <a
                      href={`/vehicle/${p.id_publicacion}`}
                      className="px-3 py-2 rounded-xl border text-sm"
                    >
                      Ver
                    </a>
                    <button
                      className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm"
                      onClick={async () => {
                        if (!confirm("Eliminar esta publicacion?")) return;
                        try {
                          const response = await apiFetch(
                            `/publications/${p.id_publicacion}`,
                            { method: "DELETE", auth: true }
                          );
                          const payload = await response.json().catch(() => ({}));
                          if (!response.ok) {
                            throw new Error(
                              payload?.detail ||
                                `No se pudo eliminar (HTTP ${response.status})`
                            );
                          }
                          setPubs((prev: any[]) =>
                            prev.filter(
                              (x) => x.id_publicacion !== p.id_publicacion
                            )
                          );
                        } catch (e: any) {
                          alert(e?.message || "Error al eliminar publicacion");
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
