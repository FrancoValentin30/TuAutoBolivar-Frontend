"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearSession, updateStoredUser } from "@/lib/auth";
import { useDialog } from "@/Componets/DialogProvider";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirmPassword:"" });
  const dialog = useDialog();

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
    if (!user) {
      await dialog.alert({
        title: "Sesión requerida",
        message: "Debes estar logueado.",
        variant: "warning",
      });
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      await dialog.alert({
        title: "Contraseñas",
        message: "Las contraseñas no coinciden.",
        variant: "warning",
      });
      return;
    }

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
    if (!r.ok) {
      await dialog.alert({
        title: "Error",
        message: data.detail || "No se pudo actualizar el perfil.",
        variant: "error",
      });
      return;
    }

    try { updateStoredUser(data); } catch {}
    setUser(data);
    await dialog.alert({
      title: "Perfil actualizado",
      message: "Tu perfil se actualizó correctamente.",
      variant: "success",
    });
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
                      await dialog.alert({
                        title: "Acción no permitida",
                        message: `No podés eliminar tu cuenta mientras tengas ${actives.length} publicación(es) activa(s). Eliminá o desactivá tus publicaciones primero.`,
                        variant: "warning",
                      });
                      return;
                    }
                  } catch {}
                }

                const confirmed = await dialog.confirm({
                  title: "Eliminar cuenta",
                  message: "¿Eliminar tu cuenta? Se realizará un borrado lógico (podrás reactivarla con un admin).",
                  confirmText: "Eliminar",
                  variant: "warning",
                });
                if (!confirmed) return;
              } catch {}
              try {
                const r = await apiFetch(`/users/me`, { method: "DELETE", auth: true });
                const j = await r.json().catch(()=>({}));
                if (!r.ok) {
                  await dialog.alert({
                    title: "Error",
                    message: j?.detail || `No se pudo eliminar (HTTP ${r.status})`,
                    variant: "error",
                  });
                  return;
                }
                clearSession();
                await dialog.alert({
                  title: "Cuenta eliminada",
                  message: "Cuenta eliminada (soft delete). Hasta luego.",
                  variant: "success",
                });
                window.location.href = "/login";
              } catch (e: any) {
                await dialog.alert({
                  title: "Error",
                  message: e?.message || "Error al eliminar cuenta",
                  variant: "error",
                });
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
