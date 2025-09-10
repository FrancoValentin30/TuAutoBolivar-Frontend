"use client";

import { Shield, Tag, Car } from "lucide-react";

export default function WhyChoose() {
  const features = [
    {
      icon: <Shield className="w-10 h-10 text-blue-600" />,
      title: "Transacciones Seguras",
      desc: "Plataforma confiable para compra y venta.",
    },
    {
      icon: <Tag className="w-10 h-10 text-green-600" />,
      title: "Mejores Ofertas",
      desc: "Encuentra precios competitivos en el mercado local.",
    },
    {
      icon: <Car className="w-10 h-10 text-purple-600" />,
      title: "Amplia Variedad",
      desc: "Gran selección de vehículos para todos los gustos.",
    },
  ];

  return (
    <section className="gradient-bg-dark py-16 text-center text-white">
      <h2 className="text-3xl font-extrabold mb-12">
        ¿Por qué elegir TuAutoBolívar?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-white rounded-full shadow-md">{f.icon}</div>
            <h3 className="font-bold text-lg">{f.title}</h3>
            <p className="text-gray-200">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
