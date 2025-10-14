"use client";

import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="gradient-bg-dark text-center py-16 text-white">
      <h2 className="text-2xl font-extrabold mb-6">
        ¿Listo para encontrar tu vehículo ideal?
      </h2>
      <Link
        href="/catalog"
        className="btn-accent text-white px-8 py-4 rounded-2xl text-lg"
      >
        Explorar Vehículos Ahora
      </Link>
    </section>
  );
}
