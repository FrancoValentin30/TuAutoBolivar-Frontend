"use client";

import { useState } from "react";
import ImageManager from "@/Componets/ImageManager";

export default function PublishPage() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [año, setAño] = useState<number | "">("");
  const [condicion, setCondicion] = useState("nuevo");
  const [combustible, setCombustible] = useState("nafta");
  const [kilometraje, setKilometraje] = useState<number | "">("");
  const [transmision, setTransmision] = useState("manual");
  const [tipo, setTipo] = useState("sedan");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [telefono, setTelefono] = useState("+549 ");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [error, setError] = useState("");


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (!imagenes.length) {
        throw new Error("Debés agregar al menos 1 imagen (JPG, PNG o WEBP, máx. 5 MB)");
      }
      const phoneSanitized = (telefono || "").replace(/\D/g, "");
      if (!phoneSanitized || phoneSanitized.length < 10) {
        throw new Error("Ingresá un teléfono válido (con característica).");
      }
      // Construir el payload que espera el backend (PublicationCreateRequest)
      const vehiculo = {
        marca,
        modelo,
        año: Number(año),
        kilometraje: Number(kilometraje),
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
        condicion: condicion === "usado" ? "Usado" : "Nuevo",
        descripcion,
      };
      const publication_data = {
        precio: Number(precio),
        telefono_contacto: phoneSanitized,
        vehiculo,
      };

      const formData = new FormData();
      formData.append("publication_data", JSON.stringify(publication_data));
      imagenes.forEach((file) => formData.append("images", file));

      // Usar el BFF que añade el Bearer desde la cookie
      const res = await fetch("/api/publications/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.detail || "Error al publicar");
      }

      alert("✅ Vehículo publicado con éxito");
      window.location.href = "/catalog";
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="flex justify-center py-12 bg-gray-100 dark:bg-[#0b0f1a] min-h-screen">
      <div className="bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center">
          Publicar Vehículo
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Marca y Modelo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
            <input
              type="text"
              placeholder="Modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
          </div>

          {/* Año, Condición, Combustible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Año"
              value={año}
              onChange={(e) => setAño(Number(e.target.value))}
              className="border px-4 py-3 rounded-xl w-full"
              required
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
              <option value="diesel">Diésel</option>
              <option value="electrico">Eléctrico</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          {/* Kilometraje, Transmisión, Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Kilometraje"
              value={kilometraje}
              onChange={(e) => setKilometraje(Number(e.target.value))}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
            <select
              value={transmision}
              onChange={(e) => setTransmision(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
            >
              <option value="manual">Manual</option>
              <option value="automatica">Automática</option>
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

          {/* Descripción */}
          <textarea
            placeholder="Descripción del vehículo"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border px-4 py-3 rounded-xl w-full"
            rows={4}
          />

          {/* Precio y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Precio en USD"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
            <input
              type="tel"
              placeholder="Ej: +549 11 2345 6789"
              value={telefono}
              onFocus={() => { if (!telefono) setTelefono("+549 "); }}
              onChange={(e) => setTelefono(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              required
            />
          </div>

          {/* Gestión de imágenes: agregar de a una, reordenar, borrar y carrusel */}
          <ImageManager files={imagenes} onChange={setImagenes} maxFiles={10} />

          {/* Botón */}
          <button
            type="submit"
            className="btn-accent w-full py-3 rounded-xl text-white font-bold"
          >
            Publicar 🚗
          </button>
        </form>
      </div>
    </main>
  );
}
