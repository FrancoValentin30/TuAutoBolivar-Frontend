"use client";

export default function Testimonials() {
  const testimonios = [
    {
      autor: "Marcos R.",
      fecha: "20/7/2025",
      mensaje:
        "Encontré mi camioneta perfecta en TuAutoBolívar en tiempo récord. ¡Altamente recomendado!",
    },
    {
      autor: "Laura P.",
      fecha: "21/7/2025",
      mensaje:
        "Vender mi auto nunca fue tan fácil. La plataforma es intuitiva y recibí varias ofertas serias.",
    },
    {
      autor: "Fernando G.",
      fecha: "22/7/2025",
      mensaje:
        "La atención al cliente de TuAutoBolívar es excepcional. Me ayudaron en cada paso.",
    },
  ];

  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-2xl font-extrabold mb-8">Testimonios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
        {testimonios.map((t, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl shadow-md bg-gray-50 text-left"
          >
            <p className="italic text-gray-700 mb-3">"{t.mensaje}"</p>
            <p className="font-bold">{t.autor}</p>
            <p className="text-sm text-gray-500">{t.fecha}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
