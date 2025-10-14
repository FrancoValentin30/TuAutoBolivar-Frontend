// src/app/layout.tsx
import "./globals.css";
import Navbar from "@/Componets/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('theme'); const m = window.matchMedia('(prefers-color-scheme: dark)').matches; if (t === 'dark' || (!t && m)) document.documentElement.classList.add('dark'); } catch (_) {} })();`,
          }}
        />
      </head>
      <body className="w-full min-h-screen bg-gray-50 dark:bg-[#0b0f1a] text-gray-900 dark:text-gray-100 flex flex-col">
        {/* HEADER dinámico con estado de sesión */}
        <Navbar />

        {/* CONTENIDO */}
        <main className="flex-grow w-full">{children}</main>

        {/* FOOTER (opcional, si lo tenías en el HTML viejo) */}
        <footer className="w-full bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 text-center py-6 mt-12">
          <p>© {new Date().getFullYear()} TuAutoBolívar - Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
