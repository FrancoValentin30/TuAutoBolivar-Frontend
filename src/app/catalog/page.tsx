// src/app/catalog/page.tsx
"use client";

import { useEffect, useState } from "react";
import VehicleCard from "@/Componets/VehicleCard";
import Modal from "@/Componets/Modal";
import ImageCarousel from "@/Componets/ImageCarousel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ORIGIN = (API_URL || "").replace(/\/api\/v1\/?$/, "");

export default function CatalogPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newTest, setNewTest] = useState("");
  const [postError, setPostError] = useState("");
  const [posted, setPosted] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [loadingSel, setLoadingSel] = useState(false);
  const [errorSel, setErrorSel] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");

  useEffect(() => {
    // Unificar vía BFF para evitar CORS y usar cookie si existe
    fetch(`/api/publications`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setPublications)
      .catch(() => setPublications([]));

    fetch(`/api/testimonials/approved`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setTestimonials)
      .catch(() => setTestimonials([]));
  }, []);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (marca.trim()) params.set("marca", marca.trim());
    if (modelo.trim()) params.set("modelo", modelo.trim());
    const url = params.toString() ? `/api/publications?${params}` : `/api/publications`;
    const r = await fetch(url, { credentials: "include" });
    const j = await r.json().catch(() => ([]));
    if (!Array.isArray(j)) {
      setPublications([]);
      return;
    }
    const norm = (s: any) => String(s ?? "").toLowerCase();
    const m = norm(marca).trim();
    const mo = norm(modelo).trim();
    const filtered = j.filter((p: any) => {
      const pm = norm(p?.vehiculo?.marca);
      const pmo = norm(p?.vehiculo?.modelo);
      const okMarca = m ? pm.includes(m) : true;
      const okModelo = mo ? pmo.includes(mo) : true;
      return okMarca && okModelo;
    });
    setPublications(filtered);
  }

  return (
    <main className="w-full">
      {/* Hero con buscador */}
      <section className="w-full gradient-bg-main text-center text-white py-16">
        <h1 className="text-4xl font-extrabold mb-6">TuAutoBolívar</h1>
        <form onSubmit={doSearch} className="flex justify-center gap-2 flex-wrap px-4">
          <input
            type="text"
            placeholder="Marca (ej: Toyota)"
            className="px-4 py-3 w-72 rounded-xl text-gray-700"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
          <input
            type="text"
            placeholder="Modelo (ej: Corolla)"
            className="px-4 py-3 w-72 rounded-xl text-gray-700"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
          <button className="btn-accent px-6 py-3 rounded-xl text-white font-semibold" type="submit">
            Buscar 🔍
          </button>
        </form>
      </section>

      {/* Vehículos */}
      <section className="w-full bg-gray-50 dark:bg-[#0b0f1a] py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Vehículos Destacados</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Explora las mejores ofertas y los vehículos más populares.
        </p>

        {publications.length === 0 ? (
          <p className="text-gray-500">No hay publicaciones disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-8">
            {publications.map((p) => (
              <VehicleCard
                key={p.id_publicacion}
                publication={p}
                onSelect={async (pub) => {
                  setErrorSel("");
                  setLoadingSel(true);
                  setOpen(true);
                  try {
                    const r = await fetch(`/api/publications/${pub.id_publicacion}`);
                    if (!r.ok) throw new Error("No se pudo cargar la publicación");
                    const j = await r.json();
                    setSelected(j);
                  } catch (e: any) {
                    setErrorSel(e?.message || "Error al cargar");
                    setSelected(null);
                  } finally {
                    setLoadingSel(false);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de detalles (como el frontend viejo) */}
      <Modal open={open} onClose={() => { setOpen(false); setSelected(null); }}>
        {loadingSel && <p>Cargando detalles...</p>}
        {errorSel && <p className="text-red-600">{errorSel}</p>}
        {!loadingSel && selected && (
          <div className="space-y-4">
            <ImageCarousel
              images={(selected.imagenes || []).map((i: any) => `${API_ORIGIN}/${i.url_imagen}`)}
            />
            <h2 className="text-2xl font-extrabold">
              {selected.vehiculo?.marca} {selected.vehiculo?.modelo} {selected.vehiculo?.año}
            </h2>
            <p className="text-gray-700">{selected.descripcion}</p>
            <p className="text-xl font-bold text-blue-600">
              ${" "}{(selected.precio ?? 0).toLocaleString("es-AR")} USD
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Kilometraje:</strong> {selected.vehiculo?.kilometraje} km</p>
              <p><strong>Condición:</strong> {selected.vehiculo?.condicion}</p>
              <p><strong>Transmisión:</strong> {selected.vehiculo?.transmision}</p>
              <p><strong>Combustible:</strong> {selected.vehiculo?.combustible}</p>
              <p><strong>Tipo:</strong> {selected.vehiculo?.tipo}</p>
              <p><strong>Estado publicación:</strong> {selected.estado}</p>
            </div>
            {selected.telefono_contacto && (
              <a
                href={`https://wa.me/${selected.telefono_contacto}`}
                target="_blank"
                className="btn-success text-white px-4 py-2 rounded-xl inline-block text-center"
              >
                Contactar por WhatsApp
              </a>
            )}
            <a
              href={`/vehicle/${selected.id_publicacion}`}
              className="btn-primary text-white px-4 py-2 rounded-xl inline-block text-center"
            >
              Ver ficha completa
            </a>
          </div>
        )}
      </Modal>

      {/* Beneficios */}
      <section className="w-full gradient-bg-dark text-white py-16 text-center">
        <h2 className="text-2xl font-bold mb-10">¿Por qué elegir TuAutoBolívar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div>
            <div className="text-4xl mb-2">🤝</div>
            <h3 className="font-bold text-lg">Transacciones Seguras</h3>
            <p>Plataforma confiable para compra y venta.</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🏷️</div>
            <h3 className="font-bold text-lg">Mejores Ofertas</h3>
            <p>Encuentra precios competitivos en el mercado local.</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🚗</div>
            <h3 className="font-bold text-lg">Amplia Variedad</h3>
            <p>Gran selección de vehículos para todos los gustos.</p>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="w-full bg-gray-50 dark:bg-[#0b0f1a] py-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Testimonios</h2>
        {testimonials.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No hay testimonios disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {testimonials.map((t) => (
              <div
                key={t.id_testimonio}
                className="p-6 bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-xl shadow text-left"
              >
                <p className="italic mb-4 text-gray-700 dark:text-gray-300">"{t.contenido || t.mensaje}"</p>
                <p className="font-bold">- {t.autor_nombre || t.autor || "Anónimo"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Form para nuevo testimonio (si está logueado) */}
        <div className="mt-10 max-w-xl mx-auto text-left">
          <h3 className="font-bold mb-2">Dejá tu testimonio</h3>
          {posted ? (
            <p className="text-green-600">¡Gracias! Tu testimonio quedará pendiente de aprobación.</p>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault(); setPostError("");
                try {
                  const u = localStorage.getItem("user");
                  if (!u) { setPostError("Debés iniciar sesión"); return; }
                  const r = await fetch("/api/testimonials", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contenido: newTest }),
                  });
                  if (!r.ok) { const j = await r.json().catch(()=>({})); throw new Error(j.detail || "No se pudo enviar"); }
                  setPosted(true); setNewTest("");
                } catch (err:any) { setPostError(err?.message || "Error"); }
              }}
              className="space-y-2"
            >
              <textarea
                value={newTest}
                onChange={(e)=>setNewTest(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="Contanos tu experiencia..."
                rows={3}
                required
              />
              {postError && <p className="text-red-600">{postError}</p>}
              <button type="submit" className="btn-primary text-white px-4 py-2 rounded-xl">Enviar</button>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full gradient-bg-main text-center text-white py-16">
        <h2 className="text-2xl font-bold mb-6">
          ¿Listo para encontrar tu vehículo ideal?
        </h2>
        <button className="btn-accent px-8 py-4 rounded-xl text-white font-bold text-lg">
          Explorar Vehículos Ahora
        </button>
      </section>
    </main>
  );
}
