"use client";

import Link from "next/link";

type Props = {
  publication: {
    id_publicacion: number;
    precio: number;
    estado: string;
    descripcion: string;
    vehiculo: {
      marca: string;
      modelo: string;
      año: number;
      transmision: string;
      combustible: string;
      condicion: string;
      kilometraje: number;
      tipo: string;
    };
    imagenes?: { url_imagen: string }[];
  };
  onSelect?: (p: Props["publication"]) => void;
};

export default function VehicleCard({ publication, onSelect }: Props) {
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");
  const img = publication.imagenes && publication.imagenes.length > 0
    ? `${API_BASE}/${publication.imagenes[0].url_imagen}`
    : "/car-placeholder.png";

  const content = (
    <div className="vehicle-card bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-2xl shadow-md overflow-hidden flex flex-col">
      <img
        src={img}
        alt={`${publication.vehiculo.marca} ${publication.vehiculo.modelo}`}
        className="h-48 w-full object-cover"
      />
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h2 className="font-bold text-xl">
            {publication.vehiculo.marca} {publication.vehiculo.modelo}{" "}
            {publication.vehiculo.año}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {publication.vehiculo.kilometraje} km ·{" "}
            {publication.vehiculo.condicion}
          </p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-extrabold text-blue-600">
            ${publication.precio.toLocaleString("es-AR")}
          </span>
          {onSelect ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(publication); }}
              className="btn-primary text-white px-4 py-2 rounded-xl"
              type="button"
            >
              Ver Detalles
            </button>
          ) : (
            <Link
              href={`/vehicle/${publication.id_publicacion}`}
              className="btn-primary text-white px-4 py-2 rounded-xl"
            >
              Ver Detalles
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); onSelect(publication); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(publication); } }}
        className="text-left"
      >
        {content}
      </div>
    );
  }

  return content;
}
