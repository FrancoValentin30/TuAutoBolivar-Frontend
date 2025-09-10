"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { API_V1 } from "@/lib/api";
import ImageManager from "@/Componets/ImageManager";

type Img = { id_imagen?: number; id?: number; url_imagen: string; es_principal?: boolean };
type Vehiculo = {
  marca: string; modelo: string; año?: number; descripcion?: string; condicion?: string;
  combustible?: string; kilometraje?: number; tipo?: string; transmision?: string;
};
type Pub = {
  id_publicacion: number; precio: number; telefono_contacto: string;
  descripcion?: string;
  vehiculo: Vehiculo; imagenes?: Img[];
};

const API_ORIGIN = (API_V1 || "").replace(/\/api\/v1\/?$/, "");

export default function EditMyVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Datos actuales
  const [pub, setPub] = useState<Pub | null>(null);

  // Campos editables
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState<number | string>("");
  const [kilometraje, setKilometraje] = useState<number | string>("");
  const [transmision, setTransmision] = useState("manual");
  const [combustible, setCombustible] = useState("nafta");
  const [tipo, setTipo] = useState("sedan");
  const [condicion, setCondicion] = useState("usado");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<number | string>("");
  const [telefono, setTelefono] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/publications/${id}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.detail || `No se pudo cargar (HTTP ${r.status})`);
        setPub(j);
        setMarca(j?.vehiculo?.marca || "");
        setModelo(j?.vehiculo?.modelo || "");
        setAnio(j?.vehiculo?.año ?? "");
        setKilometraje(j?.vehiculo?.kilometraje ?? "");
        setTransmision((j?.vehiculo?.transmision || "Manual").toString().toLowerCase() === "automatica" ? "automatica" : "manual");
        const comb = (j?.vehiculo?.combustible || "Nafta").toLowerCase();
        setCombustible(["diesel","electrico","hibrido","gnc"].includes(comb) ? comb : "nafta");
        const t = (j?.vehiculo?.tipo || "Sedan").toLowerCase();
        setTipo(["hatchback","suv","pickup","camioneta"].includes(t) ? t : "sedan");
        setCondicion(((j?.vehiculo?.condicion || "Usado") as string).toLowerCase() === "nuevo" ? "nuevo" : "usado");
        setDescripcion(j?.descripcion || "");
        setPrecio(j?.precio ?? "");
        setTelefono(j?.telefono_contacto || "");
      } catch (e: any) {
        setError(e?.message || "Error al cargar publicación");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = Array.from(e.target.files || []);
    setNewImages(f);
  }

  async function setAsPrincipal(img: Img) {
    const imageId = img.id_imagen ?? img.id;
    if (!imageId) return alert("No se puede marcar principal: id de imagen no disponible");
    try {
      const r = await fetch(`/api/publications/${id}/images/${imageId}/set-principal`, {
        method: "PATCH",
        credentials: "include",
      });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j?.detail || `No se pudo actualizar principal (HTTP ${r.status})`);
      setPub(j);
    } catch (e: any) {
      alert(e?.message || "Error al marcar principal");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const phoneSanitized = telefono.replace(/\s+/g, "");
      const vehiculo = {
        marca,
        modelo,
        año: anio ? Number(anio) : undefined,
        kilometraje: kilometraje ? Number(kilometraje) : undefined,
        transmision: transmision === "automatica" ? "Automatica" : "Manual",
        combustible:
          combustible === "diesel" ? "Diesel" :
          combustible === "electrico" ? "Electrico" :
          combustible === "hibrido" ? "Hibrido" :
          combustible === "gnc" ? "GNC" : "Nafta",
        tipo:
          tipo === "hatchback" ? "Hatchback" :
          tipo === "suv" ? "SUV" :
          tipo === "pickup" ? "Pickup" :
          tipo === "camioneta" ? "Camioneta" :
          "Sedan",
        condicion: condicion === "nuevo" ? "Nuevo" : "Usado",
        descripcion,
      };
      const payload: any = {
        precio: precio ? Number(precio) : undefined,
        telefono_contacto: phoneSanitized,
        vehiculo,
      };
      const r = await fetch(`/api/publications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j?.detail || `No se pudo actualizar (HTTP ${r.status})`);

      // Si hay imágenes nuevas, subirlas vía BFF
      if (newImages.length) {
        const fd = new FormData();
        newImages.forEach((f) => fd.append("images", f));
        const r2 = await fetch(`/api/publications/${id}/images`, { method: "POST", body: fd, credentials: "include" });
        if (!r2.ok) {
          const j2 = await r2.json().catch(()=>({}));
          throw new Error(j2?.detail || `Imágenes: error (HTTP ${r2.status})`);
        }
      }

      alert("Cambios guardados");
      router.push("/my-vehicles");
    } catch (e: any) {
      setError(e?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(img: Img) {
    const imageId = img.id_imagen ?? img.id;
    if (!imageId) return alert("No se puede eliminar: id de imagen no disponible");
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      const r = await fetch(`/api/publications/${id}/images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) {
        const j = await r.json().catch(()=>({}));
        throw new Error(j?.detail || `No se pudo eliminar (HTTP ${r.status})`);
      }
      setPub((p) => p ? ({ ...p, imagenes: (p.imagenes || []).filter((i)=> (i.id_imagen ?? i.id) !== imageId) }) : p);
    } catch (e: any) {
      alert(e?.message || "Error al eliminar imagen");
    }
  }

  if (loading) return <main className="p-6">Cargando…</main>;
  if (error) return <main className="p-6 text-red-600">{error}</main>;
  if (!pub) return <main className="p-6">Publicación no encontrada</main>;

  const currentImages = pub?.imagenes || [];

  return (
    <main className="fade-in flex justify-center py-12 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-extrabold mb-4">Editar publicación #{pub.id_publicacion}</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Marca y Modelo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border px-4 py-3 rounded-xl w-full" placeholder="Marca" value={marca} onChange={e=>setMarca(e.target.value)} required />
            <input className="border px-4 py-3 rounded-xl w-full" placeholder="Modelo" value={modelo} onChange={e=>setModelo(e.target.value)} required />
          </div>

          {/* Año, Condición, Combustible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" className="border px-4 py-3 rounded-xl w-full" placeholder="Año" value={anio} onChange={e=>setAnio(e.target.value)} />
            <select value={condicion} onChange={e=>setCondicion(e.target.value)} className="border px-4 py-3 rounded-xl w-full">
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
            <select value={combustible} onChange={e=>setCombustible(e.target.value)} className="border px-4 py-3 rounded-xl w-full">
              <option value="nafta">Nafta</option>
              <option value="diesel">Diésel</option>
              <option value="electrico">Eléctrico</option>
              <option value="hibrido">Híbrido</option>
              <option value="gnc">GNC</option>
            </select>
          </div>

          {/* Kilometraje, Transmisión, Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" className="border px-4 py-3 rounded-xl w-full" placeholder="Kilometraje" value={kilometraje} onChange={e=>setKilometraje(e.target.value)} />
            <select value={transmision} onChange={e=>setTransmision(e.target.value)} className="border px-4 py-3 rounded-xl w-full">
              <option value="manual">Manual</option>
              <option value="automatica">Automática</option>
            </select>
            <select value={tipo} onChange={e=>setTipo(e.target.value)} className="border px-4 py-3 rounded-xl w-full">
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
              <option value="suv">SUV</option>
              <option value="pickup">Pickup</option>
              <option value="camioneta">Camioneta</option>
            </select>
          </div>

          {/* Descripción */}
          <textarea className="border px-4 py-3 rounded-xl w-full" rows={4} placeholder="Descripción" value={descripcion} onChange={e=>setDescripcion(e.target.value)} />

          {/* Precio y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" className="border px-4 py-3 rounded-xl w-full" placeholder="Precio en USD" value={precio} onChange={e=>setPrecio(e.target.value)} />
            <input type="tel" className="border px-4 py-3 rounded-xl w-full" placeholder="Teléfono" value={telefono} onChange={e=>setTelefono(e.target.value)} />
          </div>

          {/* Imágenes actuales */}
          {!!currentImages.length && (
            <div className="mt-2">
              <p className="font-semibold mb-2">Imágenes actuales</p>
              <div className="flex gap-3 flex-wrap">
                {currentImages.map((img, i) => (
                  <div key={(img.id_imagen ?? img.id) ?? i} className="relative">
                    <img src={`${API_ORIGIN}/${img.url_imagen}`} className="h-24 w-32 object-cover rounded" />
                    {img.es_principal && (
                      <span className="absolute left-1 top-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded">Principal</span>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {!img.es_principal && (
                        <button type="button" className="text-[10px] bg-emerald-600 text-white rounded px-2 py-1" onClick={()=>setAsPrincipal(img)}>Hacer principal</button>
                      )}
                      <button type="button" className="text-[10px] bg-red-600 text-white rounded px-2 py-1" onClick={()=>deleteImage(img)}>Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agregar imágenes nuevas (drag & drop, reordenar, etc.) */}
          <div>
            <label className="block mb-2 font-medium">Agregar imágenes nuevas</label>
            {(() => {
              const MAX = 10; // debe coincidir con backend
              const remaining = Math.max(0, MAX - currentImages.length);
              return remaining > 0 ? (
                <ImageManager files={newImages} onChange={setNewImages} maxFiles={remaining} />
              ) : (
                <p className="text-sm text-gray-500">Alcanzaste el máximo de imágenes permitidas.</p>
              );
            })()}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-xl" onClick={()=>router.push("/my-vehicles")}>Cancelar</button>
            <button disabled={saving} className="btn-primary text-white font-bold py-2 px-6 rounded-xl">{saving ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
