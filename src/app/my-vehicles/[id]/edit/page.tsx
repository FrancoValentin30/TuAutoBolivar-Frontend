"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE, apiFetch } from "@/lib/api";
import ImageManager from "@/Componets/ImageManager";
import {
  PUBLICATION_LIMITS as LIMITS,
  PUBLICATION_WARNINGS as WARNINGS,
  getCounterClass,
  keepDigits,
} from "@/lib/publicationLimits";

type Img = {
  id_imagen?: number;
  id?: number;
  url_imagen: string;
  es_principal?: boolean;
};

type Vehiculo = {
  marca: string;
  modelo: string;
  ["a\u00f1o"]?: number;
  descripcion?: string;
  condicion?: string;
  combustible?: string;
  kilometraje?: number;
  tipo?: string;
  transmision?: string;
};

type Pub = {
  id_publicacion: number;
  precio: number;
  telefono_contacto: string;
  descripcion?: string;
  vehiculo: Vehiculo;
  imagenes?: Img[];
};

const API_ORIGIN = (API_BASE || "").replace(/\/api\/v1\/?$/, "");

const toText = (value: unknown, limit: number) =>
  typeof value === "string" ? value.slice(0, limit) : value != null ? String(value).slice(0, limit) : "";

const toDigits = (value: unknown, limit: number) => keepDigits(value != null ? String(value) : "", limit);

export default function EditMyVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pub, setPub] = useState<Pub | null>(null);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [kilometraje, setKilometraje] = useState("");
  const [transmision, setTransmision] = useState("manual");
  const [combustible, setCombustible] = useState("nafta");
  const [tipo, setTipo] = useState("sedan");
  const [condicion, setCondicion] = useState("usado");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);

  const currentImages = useMemo(() => pub?.imagenes ?? [], [pub]);

  const handleKilometrajeChange = (value: string) => {
    setKilometraje(keepDigits(value, LIMITS.kilometros));
  };

  const handlePrecioChange = (value: string) => {
    setPrecio(keepDigits(value, LIMITS.precio));
  };

  const handleAnioChange = (value: string) => {
    setAnio(keepDigits(value, 4));
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await apiFetch(`/publications/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.detail || `No se pudo cargar (HTTP ${response.status})`);
        setPub(data);
        setMarca(toText(data?.vehiculo?.marca, LIMITS.marca));
        setModelo(toText(data?.vehiculo?.modelo, LIMITS.modelo));
        setAnio(
          typeof data?.vehiculo?.["a\u00f1o"] === "number"
            ? toDigits(data.vehiculo["a\u00f1o"], 4)
            : ""
        );
        setKilometraje(toDigits(data?.vehiculo?.kilometraje, LIMITS.kilometros));
        setTransmision(
          (data?.vehiculo?.transmision || "Manual").toString().toLowerCase() === "automatica" ? "automatica" : "manual"
        );
        const comb = (data?.vehiculo?.combustible || "Nafta").toString().toLowerCase();
        setCombustible(["diesel", "electrico", "hibrido", "gnc"].includes(comb) ? comb : "nafta");
        const t = (data?.vehiculo?.tipo || "Sedan").toString().toLowerCase();
        setTipo(["hatchback", "suv", "pickup", "camioneta"].includes(t) ? t : "sedan");
        setCondicion((data?.vehiculo?.condicion || "usado").toString().toLowerCase() === "nuevo" ? "nuevo" : "usado");
        setDescripcion(toText(data?.descripcion || data?.vehiculo?.descripcion || "", LIMITS.descripcion));
        setPrecio(toDigits(data?.precio, LIMITS.precio));
        setTelefono(toDigits(data?.telefono_contacto, 20) || "");
      } catch (e) {
        const err = e as Error;
        setError(err.message || "Error al cargar publicacion");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setNewImages(files);
  }

  async function setAsPrincipal(img: Img) {
    const imageId = img.id_imagen ?? img.id;
    if (!imageId) {
      alert("No se puede marcar principal: id de imagen no disponible");
      return;
    }
    try {
      const response = await apiFetch(`/publications/${id}/images/${imageId}/set-principal`, {
        method: "PATCH",
        auth: true,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || `No se pudo actualizar principal (HTTP ${response.status})`);
      }
      setPub(payload);
    } catch (e) {
      const err = e as Error;
      alert(err.message || "Error al marcar principal");
    }
  }

  async function deleteImage(img: Img) {
    const imageId = img.id_imagen ?? img.id;
    if (!imageId) {
      alert("No se puede eliminar: id de imagen no disponible");
      return;
    }
    if (!confirm("Eliminar esta imagen?")) return;
    try {
      const response = await apiFetch(`/publications/${id}/images/${imageId}`, {
        method: "DELETE",
        auth: true,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail || `No se pudo eliminar (HTTP ${response.status})`);
      }
      setPub((prev) =>
        prev
          ? {
              ...prev,
              imagenes: (prev.imagenes || []).filter((item) => (item.id_imagen ?? item.id) !== imageId),
            }
          : prev
      );
    } catch (e) {
      const err = e as Error;
      alert(err.message || "Error al eliminar imagen");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const marcaTrim = marca.trim();
      const modeloTrim = modelo.trim();
      const descripcionTrim = descripcion.trim();
      const anioNumber = anio === "" ? undefined : Number(anio);

      if (!marcaTrim) throw new Error("Ingresa la marca (hasta 30 caracteres).");
      if (!modeloTrim) throw new Error("Ingresa el modelo (hasta 30 caracteres).");
      if (!kilometraje) throw new Error("Ingresa el kilometraje (solo numeros, maximo 9 digitos).");
      if (!precio) throw new Error("Ingresa el precio (solo numeros, maximo 9 digitos).");

      const kilometrajeNumber = Number(kilometraje);
      const precioNumber = Number(precio);
      if (!Number.isFinite(kilometrajeNumber)) throw new Error("El kilometraje debe contener solo numeros.");
      if (!Number.isFinite(precioNumber)) throw new Error("El precio debe contener solo numeros.");
      if (
        anioNumber !== undefined &&
        (!Number.isFinite(anioNumber) || anioNumber <= 0)
      ) {
        throw new Error("El anio debe ser un numero positivo.");
      }

      const phoneSanitized = telefono.replace(/\D/g, "");
      if (!phoneSanitized || phoneSanitized.length < 10) {
        throw new Error("Ingresa un telefono valido (con caracteristica).");
      }

      const vehiculo: Vehiculo = {
        marca: marcaTrim,
        modelo: modeloTrim,
        ["a\u00f1o"]: anioNumber,
        kilometraje: kilometrajeNumber,
        transmision: transmision === "automatica" ? "Automatica" : "Manual",
        combustible:
          combustible === "diesel"
            ? "Diesel"
            : combustible === "electrico"
            ? "Electrico"
            : combustible === "hibrido"
            ? "Hibrido"
            : combustible === "gnc"
            ? "GNC"
            : "Nafta",
        tipo:
          tipo === "hatchback"
            ? "Hatchback"
            : tipo === "suv"
            ? "SUV"
            : tipo === "pickup"
            ? "Pickup"
            : tipo === "camioneta"
            ? "Camioneta"
            : "Sedan",
        condicion: condicion === "nuevo" ? "Nuevo" : "Usado",
        descripcion: descripcionTrim || undefined,
      };

      const payload = {
        precio: precioNumber,
        telefono_contacto: phoneSanitized,
        vehiculo,
      };

      const response = await apiFetch(`/publications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        auth: true,
      });
      const payloadJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = payloadJson?.detail;
        if (typeof detail === "string" && detail.trim()) throw new Error(detail);
        if (Array.isArray(detail)) {
          const messages = detail
            .map((item) => item?.msg ?? item?.message ?? item?.detail)
            .filter(Boolean);
          if (messages.length) throw new Error(messages.join(" "));
        }
        throw new Error(`No se pudo actualizar (HTTP ${response.status})`);
      }

      if (newImages.length) {
        const fd = new FormData();
        for (const file of newImages) {
          const buffer = await file.arrayBuffer();
          const blob = new Blob([buffer]);
          fd.append("images", blob, file.name || "upload.jpg");
        }
        const uploadResponse = await apiFetch(`/publications/${id}/images`, {
          method: "POST",
          body: fd,
          auth: true,
        });
        if (!uploadResponse.ok) {
          const uploadPayload = await uploadResponse.json().catch(() => ({}));
          throw new Error(uploadPayload?.detail || `Imagenes: error (HTTP ${uploadResponse.status})`);
        }
      }

      alert("Cambios guardados");
      router.push("/my-vehicles");
    } catch (e) {
      const err = e as Error;
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="p-6">Cargando...</main>;
  if (error) return <main className="p-6 text-red-600">{error}</main>;
  if (!pub) return <main className="p-6">Publicacion no encontrada</main>;

  return (
    <main className="flex justify-center py-12 bg-gray-100 dark:bg-[#0b0f1a] min-h-screen">
      <div className="bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 shadow-xl rounded-2xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Editar mi publicacion</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value.slice(0, LIMITS.marca))}
                className="border px-4 py-3 rounded-xl w-full"
                required
                maxLength={LIMITS.marca}
              />
              <p className={`mt-1 text-xs text-right ${getCounterClass(marca.length, LIMITS.marca, WARNINGS.marca)}`}>
                {marca.length}/{LIMITS.marca}
              </p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value.slice(0, LIMITS.modelo))}
                className="border px-4 py-3 rounded-xl w-full"
                required
                maxLength={LIMITS.modelo}
              />
              <p className={`mt-1 text-xs text-right ${getCounterClass(modelo.length, LIMITS.modelo, WARNINGS.modelo)}`}>
                {modelo.length}/{LIMITS.modelo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Anio"
              value={anio}
              onChange={(e) => handleAnioChange(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              min={1}
            />
            <select
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
            >
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
            <select
              value={combustible}
              onChange={(e) => setCombustible(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
            >
              <option value="nafta">Nafta</option>
              <option value="diesel">Diesel</option>
              <option value="electrico">Electrico</option>
              <option value="hibrido">Hibrido</option>
              <option value="gnc">GNC</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Kilometraje"
                value={kilometraje}
                onChange={(e) => handleKilometrajeChange(e.target.value)}
                className="border px-4 py-3 rounded-xl w-full"
                required
              />
              <p className={`mt-1 text-xs text-right ${getCounterClass(kilometraje.length, LIMITS.kilometros, WARNINGS.numeric)}`}>
                {kilometraje.length}/{LIMITS.kilometros}
              </p>
            </div>
            <select
              value={transmision}
              onChange={(e) => setTransmision(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
            >
              <option value="manual">Manual</option>
              <option value="automatica">Automatica</option>
            </select>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
            >
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
              <option value="suv">SUV</option>
              <option value="pickup">Pickup</option>
              <option value="camioneta">Camioneta</option>
            </select>
          </div>

          <div>
            <textarea
              placeholder="Descripcion del vehiculo"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, LIMITS.descripcion))}
              className="border px-4 py-3 rounded-xl w-full"
              rows={5}
              maxLength={LIMITS.descripcion}
            />
            <p className={`mt-1 text-xs text-right ${getCounterClass(descripcion.length, LIMITS.descripcion, WARNINGS.descripcion)}`}>
              {descripcion.length}/{LIMITS.descripcion}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Precio en USD"
                value={precio}
                onChange={(e) => handlePrecioChange(e.target.value)}
                className="border px-4 py-3 rounded-xl w-full"
                required
              />
              <p className={`mt-1 text-xs text-right ${getCounterClass(precio.length, LIMITS.precio, WARNINGS.numeric)}`}>
                {precio.length}/{LIMITS.precio}
              </p>
            </div>
            <input
              type="tel"
              placeholder="Ej: 1123456789"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
          </div>

          {currentImages.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold mb-2">Imagenes actuales</p>
              <div className="flex gap-3 flex-wrap">
                {currentImages.map((img, index) => (
                  <div key={(img.id_imagen ?? img.id) ?? index} className="relative">
                    <img src={`${API_ORIGIN}/${img.url_imagen}`} className="h-24 w-32 object-cover rounded" />
                    {img.es_principal && (
                      <span className="absolute left-1 top-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {!img.es_principal && (
                        <button
                          type="button"
                          className="text-[10px] bg-emerald-600 text-white rounded px-2 py-1"
                          onClick={() => setAsPrincipal(img)}
                        >
                          Hacer principal
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-[10px] bg-red-600 text-white rounded px-2 py-1"
                        onClick={() => deleteImage(img)}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Agregar imagenes nuevas</label>
            {(() => {
              const MAX = 10;
              const remaining = Math.max(0, MAX - currentImages.length);
              return remaining > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Puedes sumar hasta {remaining} imagen(es) adicionales.</p>
                  <ImageManager files={newImages} onChange={setNewImages} maxFiles={remaining} />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Alcanzaste el maximo de imagenes permitidas.</p>
              );
            })()}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => router.push("/my-vehicles")}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-white font-bold py-2 px-6 rounded-xl disabled:opacity-70"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
