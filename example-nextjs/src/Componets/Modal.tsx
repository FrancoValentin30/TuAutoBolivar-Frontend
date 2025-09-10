"use client";
import { PropsWithChildren } from "react";

export default function Modal({ open, onClose, children }: PropsWithChildren<{ open: boolean; onClose: ()=>void; }>) {
  return (
    <div className={`overlay ${open ? "show":""}`} onClick={onClose}>
      <div className="modal-panel" onClick={(e)=>e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
