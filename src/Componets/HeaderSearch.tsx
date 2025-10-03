"use client";

export default function HeaderSearch() {
  return (
    <section className="gradient-bg-main text-center py-12">
      <h1 className="text-4xl font-extrabold text-white mb-6">
        TuAuto<span className="text-yellow-400">Bolívar</span>
      </h1>
      <div className="flex justify-center gap-2">
        <input
          type="text"
          placeholder="Buscar por marca, modelo..."
          className="px-4 py-3 rounded-xl w-80"
        />
        <button className="btn-accent px-6 py-3 rounded-xl text-white">
          Buscar 🔍
        </button>
      </div>
    </section>
  );
}
