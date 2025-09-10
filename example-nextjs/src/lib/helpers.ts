// src/lib/helpers.ts
// Redirige todas las llamadas autenticadas vía BFF (/api), usando cookie httpOnly
export async function authFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...options,
  });
  if (res.status === 401) {
    window.location.href = "/login";
  }
  return res;
}
