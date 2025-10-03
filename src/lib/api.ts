export const API = "/api"; // BFF base (Next)
export const API_V1 = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"; // FastAPI base

// Usa el BFF y cookies httpOnly (no agregar Authorization desde el cliente)
export function authFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
  });
}
