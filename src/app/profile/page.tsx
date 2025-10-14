"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearSession, updateStoredUser } from "@/lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirmPassword:"" });

  useEffect(()=>{
    // Cargar desde API (más confiable que localStorage)
    (async()=>{
      try {
        const r = await apiFetch('/users/me', { auth: true });
        const j = await r.json().catch(()=>({}));
        if (r.ok) {
          setUser(j);
          setForm({ name: j.name || "", email: j.email || "", phone: j.phone || "", password:"", confirmPassword:"" });
          try { updateStoredUser(j); } catch {}
        } else {
          const u = localStorage.getItem('user');
          if (u) {
            const parsed = JSON.parse(u);
            setUser(parsed);
            setForm({ name: parsed.name || "", email: parsed.email || "", phone: parsed.phone || "", password:"", confirmPassword:"" });
          }
        }
      } catch {
        const u = localStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          setUser(parsed);
          setForm({ name: parsed.name || "", email: parsed.email || "", phone: parsed.phone || "", password:"", confirmPassword:"" });
        }
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return alert("Debes estar logueado.");
    if (form.password && form.password !== form.confirmPassword) return alert("Las contraseñas no coinciden.");

    // Solo name y password (email/phone solo lectura)
    const payload: any = { name: form.name };
    if (form.password) payload.password = form.password;

    const r = await apiFetch(`/users/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      auth: true,
    });
    const data = await r.json();
    if (!r.ok) return alert(data.detail || "No se pudo actualizar el perfil.");

    try { updateStoredUser(data); } catch {}
    setUser(data);
    alert("¡Perfil actualizado!");
    setForm(s => ({ ...s, password:"", confirmPassword:"" }));
  }

  if (!user) return <div className="bg-white rounded-xl p-6">Debes iniciar sesión.</div>;

  return (
    <section className="bg-white rounded-2xl shadow-xl p-6 md:p-12 max-w-lg mx-auto">
      <h1 className="text-3xl font-extrabold">Mi Perfil</h1>
      <form className="space-y-4 mt-6" onSubmit={onSubmit}>
        <input className="w-full border p-3 rounded-xl" placeholder="Nombre" value={form.name}
               onChange={e=>setForm(s=>({ ...s, name: e.target.value }))} />
        <input className="w-full border p-3 rounded-xl bg-gray-100 text-gray-600" placeholder="Email" type="email" value={form.email} readOnly disabled />
        <input className="w-full border p-3 rounded-xl bg-gray-100 text-gray-600" placeholder="Teléfono" value={form.phone} readOnly disabled />

        <hr className="my-4" />
        <p className="text-sm text-gray-600">Cambiar contraseña (opcional)</p>
        <input className="w-full border p-3 rounded-xl" placeholder="Nueva contraseña" type="password" value={form.password}
               onChange={e=>setForm(s=>({ ...s, password: e.target.value }))} />
        <input className="w-full border p-3 rounded-xl" placeholder="Confirmar contraseña" type="password" value={form.confirmPassword}
               onChange={e=>setForm(s=>({ ...s, confirmPassword: e.target.value }))} />

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            className="text-red-600 hover:text-red-700 text-sm underline"
            onClick={async () => {
              try {
                // Chequear publicaciones activas del usuario
                let uid: number | undefined = undefined;
                try {
                  const meR = await apiFetch(`/users/me`, { auth: true });
                  const meJ = await meR.json().catch(()=>({}));
                  uid = meJ?.id_usuario ?? meJ?.id ?? meJ?.user_id;
                } catch {}
                if (uid) {
                  try {
                    const pr = await apiFetch(`/users/${uid}/publications`, { auth: true });
                    const pj = await pr.json().catch(()=>([]));
                    const actives = Array.isArray(pj)
                      ? pj.filter((p:any) => String(p?.estado ?? "").toLowerCase() === "activo")
                      : [];
                    if (actives.length > 0) {
                      alert(`No podés eliminar tu cuenta mientras tengas ${actives.length} publicación(es) activa(s). Eliminá o desactivá tus publicaciones primero.`);
                      return;
                    }
                  } catch {}
                }

                if (!confirm("¿Eliminar tu cuenta? Se realizará un borrado lógico (podrás reactivarla con un admin).")) return;
              } catch {}
              try {
                const r = await apiFetch(`/users/me`, { method: "DELETE", auth: true });
                const j = await r.json().catch(()=>({}));
                if (!r.ok) { alert(j?.detail || `No se pudo eliminar (HTTP ${r.status})`); return; }
                clearSession();
                alert("Cuenta eliminada (soft delete). Hasta luego.");
                window.location.href = "/login";
              } catch (e: any) {
                alert(e?.message || "Error al eliminar cuenta");
              }
            }}
          >
            Eliminar cuenta
          </button>

          <div className="flex gap-3">
            <a className="px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600" href="/catalog">Cancelar</a>
            <button className="btn-primary text-white font-bold py-2 px-6 rounded-xl">Guardar cambios</button>
          </div>
        </div>
      </form>
    </section>
  );
}
