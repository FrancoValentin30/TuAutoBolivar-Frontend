"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, API_BASE } from "@/lib/api";

function extractErrorMessage(detail: unknown, fallback: string): string {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const combined = detail
      .map((item) => item?.msg ?? item?.message ?? item?.detail)
      .filter(Boolean)
      .join(" ");
    if (combined.trim()) return combined;
  }
  if (typeof detail === "object") {
    const parts = Object.values(detail as Record<string, unknown>)
      .flat()
      .map((value) => (typeof value === "string" ? value : ""))
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }
  return fallback;
}

export default function AdminNewUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationErrors: string[] = [];
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      validationErrors.push("El nombre es obligatorio.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.push("Ingresa un correo electronico valido (ej. usuario@dominio.com).");
    }

    let normalizedPhone: string | undefined;
    if (trimmedPhone) {
      const digitsOnly = trimmedPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        validationErrors.push("El telefono debe contener entre 10 y 15 digitos numericos.");
      } else {
        normalizedPhone = digitsOnly;
      }
    }

    if (trimmedPassword.length < 8) {
      validationErrors.push("La contrasena debe tener al menos 8 caracteres.");
    }
    if (!/[a-z]/.test(trimmedPassword)) {
      validationErrors.push("La contrasena debe incluir al menos una letra minuscula.");
    }
    if (!/[A-Z]/.test(trimmedPassword)) {
      validationErrors.push("La contrasena debe incluir al menos una letra mayuscula.");
    }
    if (!/\d/.test(trimmedPassword)) {
      validationErrors.push("La contrasena debe incluir al menos un numero.");
    }
    if (trimmedPassword !== confirmPassword) {
      validationErrors.push("Las contrasenas deben coincidir.");
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      return;
    }

    setLoading(true);
    try {
      const registerRes = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: normalizedPhone ?? undefined,
          password: trimmedPassword,
        }),
      });
      const registerJson = await registerRes.json().catch(() => ({}));
      if (!registerRes.ok) {
        throw new Error(
          extractErrorMessage(
            registerJson?.detail,
            `No se pudo crear el usuario (HTTP ${registerRes.status})`
          )
        );
      }

      let warning: string | undefined;
      if (role !== "user") {
        const createdId: number | undefined =
          registerJson?.id_usuario ??
          registerJson?.id ??
          registerJson?.user?.id_usuario ??
          registerJson?.user?.id;

        if (createdId) {
          const changeRes = await apiFetch(`/admin/users/${createdId}/change-role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_role: role }),
            auth: true,
          });
          const changeJson = await changeRes.json().catch(() => ({}));
          if (!changeRes.ok) {
            warning = extractErrorMessage(
              changeJson?.detail,
              "Usuario creado, pero no se pudo cambiar el rol."
            );
          }
        } else {
          warning = "Usuario creado, pero no se obtuvo ID para cambiar el rol.";
        }
      }

      if (warning) {
        alert(`Usuario creado. Aviso: ${warning}`);
      } else {
        alert("Usuario creado correctamente");
      }
      router.push("/admin");
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Error desconocido al crear el usuario.");
      }
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
          <label className="block text-sm font-semibold mb-1">Telefono</label>
          <input
            className="w-full border rounded-lg px-4 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Contrasena</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Reingresa la contrasena</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Rol</label>
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Solo un superadmin podra asignar el rol "admin".
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
