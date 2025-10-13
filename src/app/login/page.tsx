// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BFF_LOGIN = process.env.NEXT_PUBLIC_API_URL + "/login" || "api/login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // console.log("Logging in with:", { email, password, BFF_LOGIN });
      const res = await fetch(BFF_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // incluye cookies
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al iniciar sesión");
      }

      const data = await res.json();
      try { localStorage.setItem("user", JSON.stringify(data)); } catch {}
      console.log("Login ok:", data);

      // redirigir según rol
      if (data.role === "superadmin" || data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/catalog");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al iniciar sesión");
      } else {
        setError("Error al iniciar sesión");
      }
    }
  }

  return (
    <main className="w-full flex items-center justify-center min-h-screen gradient-bg-dark text-white">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Iniciar Sesión</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary text-white py-3 rounded-xl font-semibold"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registrate acá
          </a>
        </p>
      </div>
    </main>
  );
}
