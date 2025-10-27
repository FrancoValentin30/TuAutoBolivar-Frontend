"use client";

import { useEffect, useState } from "react";
import Modal from "@/Componets/Modal";
import { useParams } from "next/navigation";
import { API_BASE, apiFetch } from "@/lib/api";

type Vehicle = {
  id_publicacion: number;
  precio: number;
  estado: string;
  descripcion: string;
  telefono_contacto?: string;
  vehiculo: {
    marca: string;
    modelo: string;
    ano: number;
    transmision: string;
    combustible: string;
    condicion: string;
    kilometraje: number;
    tipo: string;
  };
  imagenes?: { url_imagen: string }[];
};

const API_ORIGIN = (API_BASE || "").replace(/\/api\/v1\/?$/, "");

export default function VehicleDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`/publications/${id}`);
        if (!res.ok) throw new Error("Error al cargar vehiculo");
        const data = await res.json();
        setVehicle(data);
      } catch (err) {
        console.error("Error al cargar vehiculo:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <p className="p-6">Cargando vehiculo...</p>;
  if (!vehicle) return <p>No se encontro la publicacion.</p>;

  const images = vehicle.imagenes?.map((i) => `${API_ORIGIN}/${i.url_imagen}`) || [
    "/car-placeholder.svg",
  ];

  const desc = (vehicle as any)?.descripcion || (vehicle as any)?.vehiculo?.descripcion || "";

  return (
    <main className="fade-in px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-2xl shadow-xl p-6">
        <div className="carousel-container mb-6 relative">
          <img
            src={images[current]}
            alt={`Imagen ${current + 1}`}
            className="carousel-image"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-lg px-3 py-1 text-sm hover:bg-black/80"
            aria-label="Ampliar imagen"
          >
            Ampliar
          </button>
          <button
            className="carousel-button left"
            onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
          >
            {"<"}
          </button>
          <button
            className="carousel-button right"
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
          >
            {">"}
          </button>
        </div>

        <div className="thumbnail-reel">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setCurrent(i)}
              className={`thumbnail-item ${i === current ? "active" : ""}`}
              alt={`Miniatura ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-6">
          <h1 className="text-3xl font-extrabold mb-2">
            {vehicle.vehiculo.marca} {vehicle.vehiculo.modelo} {vehicle.vehiculo.ano}
          </h1>
          {desc && (
            <section className="mb-6">
              <h2 className="text-lg font-bold mb-2">Descripcion</h2>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0b1324] p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{desc}</p>
              </div>
            </section>
          )}
          <p className="text-2xl font-bold text-blue-600 mb-6">
            ${vehicle.precio.toLocaleString("es-AR")}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <p><strong>Kilometraje:</strong> {vehicle.vehiculo.kilometraje} km</p>
            <p><strong>Condicion:</strong> {vehicle.vehiculo.condicion}</p>
            <p><strong>Transmision:</strong> {vehicle.vehiculo.transmision}</p>
            <p><strong>Combustible:</strong> {vehicle.vehiculo.combustible}</p>
            <p><strong>Tipo:</strong> {vehicle.vehiculo.tipo}</p>
            <p><strong>Estado publicacion:</strong> {vehicle.estado}</p>
          </div>

          {vehicle.telefono_contacto && (
            <div className="mt-4">
              <a
                href={`https://wa.me/${vehicle.telefono_contacto}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-success text-white px-6 py-3 rounded-xl"
              >
                Contactar por WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="relative flex flex-col items-center gap-2">
          <img
            src={images[current]}
            alt={`Imagen ampliada ${current + 1}`}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
          />
          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
              <button
                className="carousel-button left"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
                }}
              >
                {"<"}
              </button>
              <button
                className="carousel-button right"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent((c) => (c + 1) % images.length);
                }}
              >
                {">"}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </main>
  );
}
