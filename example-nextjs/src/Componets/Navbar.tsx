"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      const m = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = t === "dark" || (!t && m);
      setIsDark(dark);
    } catch {}
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    try {
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      className="ml-2 rounded-xl px-3 py-2 border border-white/30 hover:bg-white/10 transition text-sm"
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [logged, setLogged] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | "superadmin" | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setLogged(true);
        setRole(parsed.role || "user");
      } else {
        setLogged(false);
        setRole(null);
      }
    } catch { /* ignore */ }
  }, [pathname]);

  return (
    <header className="gradient-bg-dark text-white p-4 shadow-xl sticky top-0 z-50">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center py-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 md:mb-0">
          TuAuto<span className="text-yellow-400">Bolívar</span>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-2 text-sm sm:text-base font-medium items-center">
          <Link className="nav-btn" href="/catalog">Catálogo</Link>
          {logged && <Link className="nav-btn" href="/my-vehicles">Mis Vehículos</Link>}
          {logged && <Link className="nav-btn" href="/publish">Publicar</Link>}
          {logged && <Link className="nav-btn" href="/profile">Mi Perfil</Link>}
          {logged && (role === "admin" || role === "superadmin") && <Link className="nav-btn" href="/admin">Admin</Link>}
          {!logged && <Link className="nav-btn nav-btn-highlight" href="/login">Login</Link>}
          {!logged && <Link className="nav-btn" href="/register">Registro</Link>}
          {logged && <button className="nav-btn btn-danger"
            onClick={async () => { 
              try { await fetch("/api/logout", { method: "POST" }); } catch {}
              localStorage.removeItem("user"); 
              location.href = "/login"; 
            }}>
            Cerrar Sesión
          </button>}

          {/* Toggle de tema */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
