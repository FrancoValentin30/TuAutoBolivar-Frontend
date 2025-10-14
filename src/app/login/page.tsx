"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { saveSession, clearSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginPayload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(loginPayload?.detail || "Error al iniciar sesion");
      }

      const token: string | undefined = loginPayload?.access_token;
      if (!token) {
        throw new Error("Respuesta de login invalida (sin token).");
      }

      const meRes = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json().catch(() => null);

      const sessionUser =
        meRes.ok && meData
          ? { ...meData, access_token: token, token_type: loginPayload?.token_type }
          : loginPayload;

      clearSession();
      saveSession(sessionUser, token);

      const role = sessionUser?.role;
      if (role === "superadmin" || role === "admin") {
        router.push("/admin");
      } else {
        router.push("/catalog");
      }
    } catch (err: unknown) {
      clearSession();
      if (err instanceof Error) {
        setError(err.message || "Error al iniciar sesion");
      } else {
        setError("Error al iniciar sesion");
      }
    }
  }

  return (
    <main className="w-full flex items-center justify-center min-h-screen gradient-bg-dark text-white">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Iniciar Sesion</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>
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
            <label className="block text-sm font-semibold mb-1">Contrasena</label>
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
          No tenes cuenta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registrate aca
          </a>
        </p>
      </div>
    </main>
  );
}
