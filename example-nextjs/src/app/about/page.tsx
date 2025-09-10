export default function AboutPage() {
  return (
    <section className="space-y-4 bg-white rounded-2xl shadow-xl p-6 md:p-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold">Sobre el proyecto</h1>
      <p>
        Frontend en Next.js (App Router) con Tailwind. BFF en <code>/app/api/*</code> para hablar con FastAPI
        y evitar CORS. Backend: FastAPI con endpoints públicos y privados para publicaciones y usuarios.
      </p>
      <ul className="list-disc ml-6 text-gray-700">
        <li>Catálogo y detalle de vehículos</li>
        <li>Publicación con imágenes (FormData)</li>
        <li>Login JSON y perfil de usuario</li>
        <li>Panel de administración básico</li>
      </ul>
    </section>
  );
}
