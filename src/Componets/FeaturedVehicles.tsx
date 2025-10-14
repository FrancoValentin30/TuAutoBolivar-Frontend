"use client";

import { useState, useEffect } from "react";
import VehicleCard from "./VehicleCard";
import { API_BASE, apiFetch } from "@/lib/api";

export default function FeaturedVehicles() {
  const [tab, setTab] = useState("destacados");
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/publications");
        const data = await res.json().catch(() => []);
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        setVehicles([]);
      }
    }
    load();
  }, []);

  return (
    <section className="py-12 bg-gray-50 text-center">
      <h2 className="text-2xl font-extrabold mb-2">Vehículos Destacados</h2>
      <p className="text-gray-600 mb-6">
        Explora las mejores ofertas y los vehículos más populares.
      </p>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {["Destacados", "Nuevos", "Usados", "Ofertas"].map((label) => (
          <button
            key={label}
            className={`px-4 py-2 rounded-full border ${
              tab === label.toLowerCase()
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setTab(label.toLowerCase())}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {vehicles.length === 0 ? (
          <p>No hay publicaciones disponibles.</p>
        ) : (
          vehicles.map((v) => <VehicleCard key={v.id_publicacion} publication={v} />)
        )}
      </div>
    </section>
  );
}
