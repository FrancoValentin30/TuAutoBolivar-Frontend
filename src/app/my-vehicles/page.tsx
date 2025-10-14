"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MyVehiclesPage() {
  const [pubs, setPubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) throw new Error("Debes iniciar sesión");
        const user = JSON.parse(raw);
        const r = await apiFetch(`/users/${user.id}/publications`, { auth: true });
        if (!r.ok) throw new Error(`Error ${r.status}`);
        const j = await r.json();
        setPubs(j || []);
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar tus publicaciones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <main className="p-6">Cargando…</main>;

  return (
    <main className="fade-in p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Mis Vehículos</h1>
      {error && (
        <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-2">{error}</div>
      )}
      {pubs.length === 0 ? (
        <p className="text-gray-600">Aún no tenés publicaciones. <a className="text-blue-600 underline" href="/publish">Publicá una</a>.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubs.map((p: any) => (
            <div key={p.id_publicacion} className="bg-white shadow rounded-2xl overflow-hidden hover:shadow-lg transition">
              <a href={`/vehicle/${p.id_publicacion}`} className="block">
                <img
                  src={p.imagenes?.length ? `${(process.env.NEXT_PUBLIC_API_URL||"").replace(/\/api\/v1\/?$/, "")}/${p.imagenes[0].url_imagen}` : "/car-placeholder.png"}
                  alt="Vehículo"
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-4">
                <h3 className="font-bold text-lg">{p.vehiculo?.marca} {p.vehiculo?.modelo} {p.vehiculo?.año}</h3>
                <p className="text-gray-600">{(p.precio||0).toLocaleString("es-AR")} USD</p>
                <div className="flex gap-2 mt-3">
                  <a href={`/my-vehicles/${p.id_publicacion}/edit`} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm">Editar</a>
                  <a href={`/vehicle/${p.id_publicacion}`} className="px-3 py-2 rounded-xl border text-sm">Ver</a>
                  <button
                    className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm"
                    onClick={async () => {
                      if (!confirm("¿Eliminar esta publicación?")) return;
                      try {
                        const r = await apiFetch(`/publications/${p.id_publicacion}`, { method: "DELETE", auth: true });
                        const j = await r.json().catch(()=>({}));
                        if (!r.ok) throw new Error(j?.detail || `No se pudo eliminar (HTTP ${r.status})`);
                        // quitar de la grilla
                        setPubs((prev:any[]) => prev.filter(x => x.id_publicacion !== p.id_publicacion));
                      } catch (e: any) {
                        alert(e?.message || "Error al eliminar publicación");
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
