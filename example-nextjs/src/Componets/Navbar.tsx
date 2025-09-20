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
      document.documentElement.classList.toggle("dark", dark);
    } catch {}
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // estado login
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
    } catch {}
  }, [pathname]);

  // detectar tema inicial
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  // observar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // bloqueo scroll
  useEffect(() => {
    const body = document.body;
    if (isMenuOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.classList.add("body-lock");
      body.style.setProperty("--scrollbar-width", `${scrollBarWidth}px`);
    } else {
      body.classList.remove("body-lock");
      body.style.removeProperty("--scrollbar-width");
    }
  }, [isMenuOpen]);

  // delay render menú
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isMenuOpen) t = setTimeout(() => setShowMenu(true), 0);
    else setShowMenu(false);
    return () => clearTimeout(t);
  }, [isMenuOpen]);

  const links = [
    { href: "/catalog", label: "Catálogo" },
    ...(logged ? [{ href: "/my-vehicles", label: "Mis Vehículos" }] : []),
    ...(logged ? [{ href: "/publish", label: "Publicar" }] : []),
    ...(logged ? [{ href: "/profile", label: "Mi Perfil" }] : []),
    ...(logged && (role === "admin" || role === "superadmin")
      ? [{ href: "/admin", label: "Admin" }]
      : []),
    ...(!logged ? [{ href: "/login", label: "Login", highlight: true }] : []),
    ...(!logged ? [{ href: "/register", label: "Registro" }] : []),
  ];

  const headerClasses = [
    "sticky top-0 z-50 shadow-md transition-all duration-300",
    isDark ? "navbar-dark" : "navbar-light"
  ].join(" ");

  return (
    <header className={headerClasses}>
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <div className="text-2xl font-extrabold tracking-tight">
          TuAuto<span className="text-yellow-400">Bolívar</span>
        </div>

        {/* Desktop */}
        <nav className="hidden md:flex gap-2 text-sm font-medium items-center">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-btn ${item.highlight ? "nav-btn-highlight" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          {logged && (
            <button
              className="nav-btn btn-danger"
              onClick={async () => {
                try {
                  await fetch("/api/logout", { method: "POST" });
                } catch {}
                localStorage.removeItem("user");
                location.href = "/login";
              }}
            >
              Cerrar Sesión
            </button>
          )}
          <ThemeToggle />
        </nav>

        {/* Botón móvil */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((p) => !p)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10 hover:bg-white/20"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Overlay móvil */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menú móvil */}
      {showMenu && (
        <aside
          className={`fixed right-0 top-0 z-50 h-screen w-full max-w-xs 
              ${isDark
                ? "bg-gradient-to-b from-[#0b0f1a] via-[#111c2d] to-[#1f2937]"
                : "bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]"}
              px-6 py-8 shadow-2xl transition-transform duration-300 md:hidden ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
          aria-hidden={!isMenuOpen}
          data-inert={!isMenuOpen}
        >
          <div className="flex flex-col gap-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-btn w-full text-center ${item.highlight ? "nav-btn-highlight" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {logged && (
              <button
                className="nav-btn btn-danger w-full text-center"
                onClick={async () => {
                  try {
                    await fetch("/api/logout", { method: "POST" });
                  } catch {}
                  localStorage.removeItem("user");
                  location.href = "/login";
                }}
              >
                Cerrar Sesión
              </button>
            )}
            <ThemeToggle />
          </div>
        </aside>
      )}
    </header>
  );
}
