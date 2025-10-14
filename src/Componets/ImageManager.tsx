"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  files: File[];
  onChange: (next: File[]) => void;
  maxFiles?: number;
  maxBytes?: number; // por defecto 5MB
  allowedTypes?: string[]; // por defecto JPG/PNG/WEBP
};

export default function ImageManager({
  files,
  onChange,
  maxFiles = 10,
  maxBytes = 5 * 1024 * 1024,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const canAdd = files.length < maxFiles;
  const remaining = Math.max(0, maxFiles - files.length);
  const [msg, setMsg] = useState<string>("");

  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [urls]);

  useEffect(() => {
    if (current > files.length - 1) setCurrent(Math.max(0, files.length - 1));
  }, [files.length, current]);

  function addOne(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ""; // reset input
    if (!f) return;
    if (files.length >= maxFiles) {
      setMsg("Alcanzaste el máximo de imágenes permitido");
      return;
    }
    // Validar tipo por MIME y por extensión
    const name = (f.name || "").toLowerCase();
    const okMime = allowedTypes.includes(f.type);
    const okExt = [".jpg", ".jpeg", ".png", ".webp"].some(ext => name.endsWith(ext));
    if (!okMime || !okExt) {
      setMsg("Formato no soportado. Usá JPG, PNG o WEBP");
      return;
    }
    // Validar tamaño
    if (typeof f.size === "number" && f.size > maxBytes) {
      const mb = Math.floor(maxBytes / (1024 * 1024));
      setMsg(`Cada imagen debe pesar menos de ${mb} MB`);
      return;
    }
    onChange([...files, f]);
    setMsg("");
  }

  function removeAt(i: number) {
    const next = files.slice();
    next.splice(i, 1);
    onChange(next);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= files.length) return;
    const next = files.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
    setCurrent(to);
  }

  function setPrincipal(i: number) {
    move(i, 0);
  }

  function onDragStart(i: number) {
    setDragIndex(i);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(i: number) {
    if (dragIndex === null || dragIndex === i) return;
    move(dragIndex, i);
    setDragIndex(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="block font-medium">Imágenes</label>
        <span className="text-sm text-gray-500">(máx. {maxFiles})</span>
      </div>

      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={addOne} disabled={!canAdd} />
        <span className="text-sm text-gray-500">
          {files.length}/{maxFiles}{!canAdd ? " · Límite alcanzado" : ` · Te quedan ${remaining}`}
        </span>
      </div>

      <p className="text-sm text-gray-500">Tipos permitidos: JPG, PNG, WEBP. Máximo {Math.floor(maxBytes/(1024*1024))} MB por imagen.</p>
      {msg && (
        <div className="text-sm text-red-600">{msg}</div>
      )}

      {!!files.length && (
        <div className="rounded-xl border dark:border-gray-700 p-3">
          {/* Carrusel grande */}
          <div className="relative flex items-center justify-center mb-3">
            <div className="w-full max-w-xl aspect-video bg-gray-100 dark:bg-[#0b1324] rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={urls[current]}
                className="object-contain max-h-full max-w-full"
                alt={`Imagen ${current + 1}`}
              />
            </div>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/40 px-3 py-2 shadow"
              onClick={() => setCurrent((c) => (c === 0 ? files.length - 1 : c - 1))}
            >
              ◀
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/40 px-3 py-2 shadow"
              onClick={() => setCurrent((c) => (c + 1) % files.length)}
            >
              ▶
            </button>
          </div>

          {/* Tira de miniaturas con DnD y acciones */}
          <div className="flex flex-wrap gap-3">
            {files.map((f, i) => (
              <div
                key={i}
                className={`relative border rounded-lg overflow-hidden group ${i === 0 ? "ring-2 ring-blue-500" : ""}`}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(i)}
              >
                <img
                  src={urls[i]}
                  className="h-24 w-32 object-cover cursor-move"
                  onClick={() => setCurrent(i)}
                  alt={`Miniatura ${i + 1}`}
                />

                {i === 0 && (
                  <span className="absolute left-1 top-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded">
                    Principal
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 p-1 bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    className="text-white text-xs bg-blue-600/90 rounded px-2 py-0.5"
                    onClick={() => move(i, i - 1)}
                  >↑</button>
                  <button
                    type="button"
                    className="text-white text-xs bg-blue-600/90 rounded px-2 py-0.5"
                    onClick={() => move(i, i + 1)}
                  >↓</button>
                  {i !== 0 && (
                    <button
                      type="button"
                      className="text-white text-xs bg-emerald-600/90 rounded px-2 py-0.5"
                      onClick={() => setPrincipal(i)}
                    >Principal</button>
                  )}
                  <button
                    type="button"
                    className="text-white text-xs bg-red-600/90 rounded px-2 py-0.5"
                    onClick={() => removeAt(i)}
                  >Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
