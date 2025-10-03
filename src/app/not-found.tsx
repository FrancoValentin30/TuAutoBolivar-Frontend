export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h2 className="text-3xl font-extrabold">404</h2>
      <p className="text-gray-600 mt-2">La página que buscás no existe.</p>
      <a href="/catalog" className="text-indigo-600 hover:underline mt-4 inline-block">Volver al catálogo</a>
    </div>
  );
}
