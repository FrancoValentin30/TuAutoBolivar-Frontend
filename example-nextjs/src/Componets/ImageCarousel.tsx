"use client";
import { useState } from "react";
import Modal from "./Modal";

export default function ImageCarousel({ images = [] as string[] }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const go = (d: number) => setIdx(i => (i + d + images.length) % images.length);

  if (images.length === 0) return null;

  return (
    <div className="carousel-container relative">
      <img className="carousel-image" src={images[idx]} alt={`img-${idx}`} />
      {/* Botón ampliar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 bg-black/60 text-white rounded-lg px-3 py-1 text-sm hover:bg-black/80"
        aria-label="Ampliar imagen"
      >
        Ampliar
      </button>
      {images.length > 1 && (
        <>
          <button className="carousel-button left" onClick={() => go(-1)}>‹</button>
          <button className="carousel-button right" onClick={() => go(1)}>›</button>
        </>
      )}
      <div className="thumbnail-reel">
        {images.map((src, i) => (
          <img
            key={i}
            className={`thumbnail-item ${i === idx ? "active" : ""}`}
            src={src} onClick={()=>setIdx(i)} alt={`thumb-${i}`}
          />
        ))}
      </div>
      {/* Lightbox */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="relative flex flex-col items-center gap-2">
          <img
            src={images[idx]}
            alt={`full-${idx}`}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
          />
          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
              <button
                className="carousel-button left"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(-1); }}
              >
                ‹
              </button>
              <button
                className="carousel-button right"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(1); }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
