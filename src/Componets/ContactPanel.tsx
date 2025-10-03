"use client";
import Modal from "./Modal";

export default function ContactPanel({ open, onClose, name, email, phone }:{
  open: boolean; onClose: ()=>void; name: string; email: string; phone: string;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="confirmation-modal-content">
        <h3 className="text-2xl font-bold mb-2">Contacto</h3>
        <p className="text-gray-700 mb-4">¿Interesado en este vehículo? Contactá al vendedor.</p>
        <div className="space-y-2">
          <p><b>Nombre:</b> {name}</p>
          <p><b>Email:</b> <a className="text-blue-600" href={`mailto:${email}`}>{email}</a></p>
          <p><b>Teléfono:</b> <a className="text-blue-600" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></p>
        </div>
        <div className="modal-buttons">
          <button className="btn-primary text-white rounded-xl px-6 py-2 mt-6" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </Modal>
  );
}
