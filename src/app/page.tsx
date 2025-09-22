"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="w-full">
      {/* Hero principal */}
      <header className="w-full gradient-bg-main text-center text-white py-20">
        <h1 className="text-5xl font-extrabold mb-6">TuAutoBolívar</h1>
        <div className="flex justify-center gap-2">
          <input
            type="text"
            placeholder="Buscar por marca, modelo..."
            className="px-4 py-3 w-96 rounded-xl text-gray-700"
          />
          <button className="btn-accent px-6 py-3 rounded-xl text-white font-semibold">
            Buscar 🔍
          </button>
        </div>
      </header>

      {/* Beneficios */}
      <section className="w-full gradient-bg-dark text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">
          ¿Por qué elegir TuAutoBolívar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12">
          <div>
            <div className="text-5xl mb-2">🤝</div>
            <h3 className="font-bold text-lg">Transacciones Seguras</h3>
            <p>Plataforma confiable para compra y venta.</p>
          </div>
          <div>
            <div className="text-5xl mb-2">🏷️</div>
            <h3 className="font-bold text-lg">Mejores Ofertas</h3>
            <p>Encuentra precios competitivos en el mercado local.</p>
          </div>
          <div>
            <div className="text-5xl mb-2">🚗</div>
            <h3 className="font-bold text-lg">Amplia Variedad</h3>
            <p>Gran selección de vehículos para todos los gustos.</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full gradient-bg-main text-center text-white py-16">
        <h2 className="text-3xl font-bold mb-6">
          ¿Listo para encontrar tu vehículo ideal?
        </h2>
        <Link href="/catalog">
          <button className="btn-accent px-8 py-4 rounded-xl text-white font-bold text-lg">
            Explorar Vehículos Ahora
          </button>
        </Link>
      </section>
    </main>
  );
}
