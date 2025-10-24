"use client";

import { useState } from "react";
import ImageManager from "@/Componets/ImageManager";
import {
  PUBLICATION_LIMITS as LIMITS,
  PUBLICATION_WARNINGS as WARNINGS,
  getCounterClass,
  keepDigits,
} from "@/lib/publicationLimits";
import { apiFetch } from "@/lib/api";

export default function PublishPage() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [condicion, setCondicion] = useState("nuevo");
  const [combustible, setCombustible] = useState("nafta");
  const [kilometraje, setKilometraje] = useState("");
  const [transmision, setTransmision] = useState("manual");
  const [tipo, setTipo] = useState("sedan");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [telefono, setTelefono] = useState("+549 ");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [error, setError] = useState("");

  const handleKilometrajeChange = (value: string) => {
    setKilometraje(keepDigits(value, LIMITS.kilometros));
  };

  const handlePrecioChange = (value: string) => {
    setPrecio(keepDigits(value, LIMITS.precio));
  };

  const handleAnioChange = (value: string) => {
    setAnio(keepDigits(value, 4));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (!imagenes.length) {
        throw new Error("Debes agregar al menos 1 imagen (JPG, PNG o WEBP, max. 5 MB).");
      }

      const marcaTrim = marca.trim();
      const modeloTrim = modelo.trim();
      const descripcionTrim = descripcion.trim();

      if (!marcaTrim) {
        throw new Error("Ingresa la marca (hasta 30 caracteres).");
      }
      if (!modeloTrim) {
        throw new Error("Ingresa el modelo (hasta 30 caracteres).");
      }
      if (!kilometraje) {
        throw new Error("Ingresa el kilometraje (solo numeros, maximo 9 digitos).");
      }
      if (!precio) {
        throw new Error("Ingresa el precio (solo numeros, maximo 9 digitos).");
      }

      const kilometrajeNumber = Number(kilometraje);
      const precioNumber = Number(precio);
      const anioNumber = Number(anio);

      if (!Number.isFinite(kilometrajeNumber)) {
        throw new Error("El kilometraje debe contener solo numeros.");
      }
      if (!Number.isFinite(precioNumber)) {
        throw new Error("El precio debe contener solo numeros.");
      }
      if (!Number.isFinite(anioNumber) || anioNumber <= 0) {
        throw new Error("El anio debe ser un numero positivo.");
      }

      const phoneSanitized = (telefono || "").replace(/\D/g, "");
      if (!phoneSanitized || phoneSanitized.length < 10) {
        throw new Error("Ingresa un telefono valido (con caracteristica).");
      }

      const vehiculo = {
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
        condicion: condicion === "usado" ? "Usado" : "Nuevo",
        descripcion: descripcionTrim || undefined,
      };

      const publicationData = {
        precio: precioNumber,
        telefono_contacto: phoneSanitized,
        vehiculo,
      };

      const forward = new FormData();
      forward.append("publication_data", JSON.stringify(publicationData));
      for (const file of imagenes) {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer]);
        forward.append("images", blob, file.name || "upload.jpg");
      }

      const res = await apiFetch("/publications", {
        method: "POST",
        body: forward,
        auth: true,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = payload?.detail;
        if (typeof detail === "string" && detail.trim()) {
          throw new Error(detail);
        }
        if (Array.isArray(detail)) {
          const messages = detail
            .map((item) => item?.msg ?? item?.message ?? item?.detail)
            .filter(Boolean);
          if (messages.length) {
            throw new Error(messages.join(" "));
          }
        }
        throw new Error("Error al publicar.");
      }

      alert(
        payload?.message ??
          "Vehiculo enviado a revision. Te avisaremos cuando sea aprobado."
      );
      window.location.href = "/catalog";
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("No se pudo publicar, intenta nuevamente.");
      }
    }
  }

  return (
    <main className="flex justify-center py-12 bg-gray-100 dark:bg-[#0b0f1a] min-h-screen">
      <div className="bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Publicar Vehiculo</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              required
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
              placeholder="Ej: +549 11 2345 6789"
              value={telefono}
              onFocus={() => {
                if (!telefono) setTelefono("+549 ");
              }}
              onChange={(e) => setTelefono(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
          </div>

          <ImageManager files={imagenes} onChange={setImagenes} maxFiles={10} />

          <button type="submit" className="btn-accent w-full py-3 rounded-xl text-white font-bold">
            Publicar
          </button>
        </form>
      </div>
    </main>
  );
}
