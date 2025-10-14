export default function AboutPage() {
  return (
    <section className="space-y-4 bg-white rounded-2xl shadow-xl p-6 md:p-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold">Sobre el proyecto</h1>
      <p>
        Frontend en Next.js (App Router) con Tailwind. El cliente habla directo con FastAPI usando fetch con
        tokens Bearer guardados en localStorage. Backend: FastAPI con endpoints publicos y privados para
        publicaciones y usuarios.
      </p>
      <ul className="list-disc ml-6 text-gray-700">
        <li>Catalogo y detalle de vehiculos</li>
        <li>Publicacion con imagenes (FormData)</li>
        <li>Login JSON y perfil de usuario</li>
        <li>Panel de administracion basico</li>
      </ul>
    </section>
  );
}

