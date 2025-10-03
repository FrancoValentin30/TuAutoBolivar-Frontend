"use client";
import { PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  variant?: "default" | "lightbox";
}>;

export default function Modal({ open, onClose, children, variant = "default" }: ModalProps) {
  return (
    <div className={`overlay ${open ? "show" : ""}`} onClick={onClose}>
      <div
        className={`modal-panel ${variant === "lightbox" ? "lightbox-panel" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
