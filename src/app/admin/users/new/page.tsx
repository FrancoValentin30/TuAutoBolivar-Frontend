"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNewUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 201) {
        throw new Error(j?.detail || `No se pudo crear el usuario (HTTP ${res.status})`);
      }
      if (j?.warning) {
        alert(`Usuario creado. Aviso: ${j.warning}`);
      } else {
        alert("Usuario creado correctamente");
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fade-in max-w-2xl mx-auto bg-white dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-2xl shadow-xl p-6">
      <h1 className="text-2xl font-extrabold mb-4">Nuevo Usuario</h1>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input
            className="w-full border rounded-lg px-4 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-4 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Teléfono</label>
          <input
            className="w-full border rounded-lg px-4 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Rol</label>
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Solo un superadmin podrá asignar el rol "admin".
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-white px-4 py-2 rounded-xl disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-4 py-2 rounded-xl border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}

