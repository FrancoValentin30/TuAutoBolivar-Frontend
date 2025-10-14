"use client";

import { useEffect, useState } from "react";
import VehicleCard from "@/Componets/VehicleCard";
import Modal from "@/Componets/Modal";
import ImageCarousel from "@/Componets/ImageCarousel";
import { apiFetch, ApiFetchOptions } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ORIGIN = (API_URL || "").replace(/\/api\/v1\/?$/, "");

const TESTIMONIAL_ENDPOINTS = [
  "/testimonials",
  "/testimonios",
];

const TESTIMONIAL_APPROVED_ENDPOINTS = [
  "/testimonials/approved",
  "/testimonios/aprobados",
];

async function fetchWithFallback(
  paths: string[],
  init?: ApiFetchOptions
): Promise<{ data: any; ok: boolean }> {
  for (const path of paths) {
    try {
      const res = await apiFetch(path, init);
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return { data, ok: true };
      }
      if (res.status < 500) {
        return { data, ok: false };
      }
    } catch {
      // intentar siguiente path
    }
  }
  return { data: null, ok: false };
}

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
    async function loadInitialData() {
      try {
        const res = await apiFetch("/publications");
        const items = await res.json().catch(() => []);
        setPublications(Array.isArray(items) ? items : []);
      } catch {
        setPublications([]);
      }

      try {
        const { data, ok } = await fetchWithFallback(TESTIMONIAL_APPROVED_ENDPOINTS);
        setTestimonials(ok && Array.isArray(data) ? data : []);
      } catch {
        setTestimonials([]);
      }
    }

    loadInitialData();
  }, []);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (marca.trim()) params.set("marca", marca.trim());
    if (modelo.trim()) params.set("modelo", modelo.trim());
    const endpoint = params.toString() ? `/publications?${params}` : "/publications";

    try {
      const res = await apiFetch(endpoint);
      const items = await res.json().catch(() => []);
      if (!Array.isArray(items)) {
        setPublications([]);
        return;
      }
      const norm = (value: any) => String(value ?? "").toLowerCase().trim();
      const m = norm(marca);
      const mo = norm(modelo);
      const filtered = items.filter((p: any) => {
        const pm = norm(p?.vehiculo?.marca);
        const pmo = norm(p?.vehiculo?.modelo);
        const okMarca = m ? pm.includes(m) : true;
        const okModelo = mo ? pmo.includes(mo) : true;
        return okMarca && okModelo;
      });
      setPublications(filtered);
    } catch {
      setPublications([]);
    }
  }

  async function handleSelectPublication(id: number) {
    setErrorSel("");
    setLoadingSel(true);
    setOpen(true);
    try {
      const res = await apiFetch(`/publications/${id}`);
      if (!res.ok) throw new Error("No se pudo cargar la publicacion");
      const data = await res.json();
      setSelected(data);
    } catch (err: any) {
      setErrorSel(err?.message || "Error al cargar");
      setSelected(null);
    } finally {
      setLoadingSel(false);
    }
  }

  async function handleSubmitTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setPostError("");
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!storedUser) {
      setPostError("Debes iniciar sesion");
      return;
    }

    try {
      const body = JSON.stringify({ contenido: newTest });
      const { data, ok } = await fetchWithFallback(TESTIMONIAL_ENDPOINTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        auth: true,
      });

      if (!ok) {
        throw new Error(data?.detail || "No se pudo enviar el testimonio");
      }

      setPosted(true);
      setNewTest("");
    } catch (err: any) {
      setPostError(err?.message || "Error al enviar testimonio");
    }
  }

  return (
    <main className="w-full">
      <section className="w-full gradient-bg-main text-center text-white py-16">
        <h1 className="text-4xl font-extrabold mb-6">TuAutoBolivar</h1>
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
            Buscar
          </button>
        </form>
      </section>

      <section className="w-full bg-gray-50 dark:bg-[#0b0f1a] py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Vehiculos Destacados</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Explora las mejores ofertas y los vehiculos mas populares.
        </p>

        {publications.length === 0 ? (
          <p className="text-gray-500">No hay publicaciones disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-8">
            {publications.map((p) => (
              <VehicleCard
                key={p.id_publicacion}
                publication={p}
                onSelect={() => handleSelectPublication(p.id_publicacion)}
              />
            ))}
          </div>
        )}
      </section>

      <Modal open={open} onClose={() => { setOpen(false); setSelected(null); }}>
        {loadingSel ? (
          <p className="p-6 text-center text-gray-600">Cargando...</p>
        ) : errorSel ? (
          <div className="p-6 text-center text-red-600">{errorSel}</div>
        ) : selected ? (
          <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
            <h3 className="text-2xl font-extrabold">{selected.titulo || "Publicacion"}</h3>
            <ImageCarousel
              images={(selected.imagenes || []).map((img: any) => `${API_ORIGIN}/${img.url_imagen}`)}
            />
            <div className="space-y-2 text-left text-sm">
              <p><strong>Precio:</strong> USD {selected.precio?.toLocaleString?.() ?? selected.precio}</p>
              <p><strong>Marca:</strong> {selected.vehiculo?.marca}</p>
              <p><strong>Modelo:</strong> {selected.vehiculo?.modelo}</p>
              <p><strong>Año:</strong> {selected.vehiculo?.año ?? selected.vehiculo?.ano}</p>
              <p><strong>Kilometraje:</strong> {selected.vehiculo?.kilometraje?.toLocaleString?.() ?? selected.vehiculo?.kilometraje}</p>
              <p><strong>Descripcion:</strong> {selected.vehiculo?.descripcion}</p>
              <p><strong>Condicion:</strong> {selected.vehiculo?.condicion}</p>
              <p><strong>Transmision:</strong> {selected.vehiculo?.transmision}</p>
              <p><strong>Combustible:</strong> {selected.vehiculo?.combustible}</p>
              <p><strong>Tipo:</strong> {selected.vehiculo?.tipo}</p>
              <p><strong>Estado publicacion:</strong> {selected.estado}</p>
            </div>
            {selected.telefono_contacto && (
              <a
                href={`https://wa.me/${selected.telefono_contacto}`}
                target="_blank"
                rel="noopener noreferrer"
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
        ) : null}
      </Modal>

      <section className="w-full gradient-bg-dark text-white py-16 text-center">
        <h2 className="text-2xl font-bold mb-10">Por que elegir TuAutoBolivar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div>
            <span className="inline-block text-sm uppercase tracking-widest mb-2 text-white/80">Auto</span>
            <h3 className="font-bold text-lg">Transacciones Seguras</h3>
            <p>Plataforma confiable para compra y venta.</p>
          </div>
          <div>
            <span className="inline-block text-sm uppercase tracking-widest mb-2 text-white/80">Ofertas</span>
            <h3 className="font-bold text-lg">Mejores Ofertas</h3>
            <p>Encuentra precios competitivos en el mercado local.</p>
          </div>
          <div>
            <span className="inline-block text-sm uppercase tracking-widest mb-2 text-white/80">Variedad</span>
            <h3 className="font-bold text-lg">Amplia Variedad</h3>
            <p>Gran seleccion de vehiculos para todos los gustos.</p>
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-50 dark:bg-[#0b0f1a] py-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Testimonios</h2>
        {testimonials.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No hay testimonios disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {testimonials.map((t) => (
              <div
                key={t.id_testimonio || t.id}
                className="p-6 bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-xl shadow text-left"
              >
                <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                  "{t.contenido || t.mensaje}"
                </p>
                <p className="font-bold">- {t.autor_nombre || t.autor || "Anonimo"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 max-w-xl mx-auto text-left">
          <h3 className="font-bold mb-2">Deja tu testimonio</h3>
          {posted ? (
            <p className="text-green-600">Gracias! Tu testimonio quedara pendiente de aprobacion.</p>
          ) : (
            <form onSubmit={handleSubmitTestimonial} className="space-y-2">
              <textarea
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="Contanos tu experiencia..."
                rows={3}
                required
              />
              {postError && <p className="text-red-600">{postError}</p>}
              <button type="submit" className="btn-primary text-white px-4 py-2 rounded-xl">
                Enviar
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="w-full gradient-bg-main text-center text-white py-16">
        <h2 className="text-2xl font-bold mb-6">
          Listo para encontrar tu vehiculo ideal?
        </h2>
        <button className="btn-accent px-8 py-4 rounded-xl text-white font-bold text-lg">
          Explorar Vehiculos Ahora
        </button>
      </section>
    </main>
  );
}
