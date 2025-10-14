"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationErrors: string[] = [];
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const cleanedPhone = phone.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.push(
        "El correo electronico debe incluir un dominio valido (ej. usuario@dominio.com)."
      );
    }

    let normalizedPhone: string | undefined;
    if (cleanedPhone) {
      const digitsOnly = cleanedPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        validationErrors.push("El telefono debe contener entre 10 y 15 digitos numericos.");
      } else {
        normalizedPhone = digitsOnly;
      }
    }

    if (password.length < 8) {
      validationErrors.push("La contrasena debe tener al menos 8 caracteres.");
    }
    if (!/[a-z]/.test(password)) {
      validationErrors.push("La contrasena debe incluir al menos una letra minuscula.");
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push("La contrasena debe incluir al menos una letra mayuscula.");
    }
    if (!/\d/.test(password)) {
      validationErrors.push("La contrasena debe incluir al menos un numero.");
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: normalizedPhone ?? undefined,
          password,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        let message = "No se pudo registrar";
        const detail = payload?.detail;

        if (typeof detail === "string" && detail.trim().length > 0) {
          message = detail;
        } else if (Array.isArray(detail)) {
          const extracted = detail
            .map((item) => item?.msg ?? item?.message ?? item?.detail)
            .filter(Boolean);
          if (extracted.length > 0) {
            message = extracted.join(" ");
          }
        }

        setError(message);
        return;
      }

      alert(payload?.message ?? "Usuario registrado con exito");
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("No se pudo registrar, intenta nuevamente.");
      }
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen gradient-bg-main text-white">
      <form
        onSubmit={handleRegister}
        className="bg-white text-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mb-4 px-4 py-3 border rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-3 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Telefono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-4 px-4 py-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-4 py-3 border rounded-lg"
        />

        <button
          type="submit"
          className="btn-accent w-full py-3 rounded-xl text-white font-semibold"
        >
          Registrarme
        </button>
      </form>
    </main>
  );
}
