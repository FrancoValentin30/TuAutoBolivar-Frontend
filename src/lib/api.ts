import { clearSession, getStoredToken } from "./auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE.replace(/\/$/, "")}${normalized}`;
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { auth = false, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders || undefined);

  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (auth) {
    throw new Error("Sesión no encontrada. Inicia sesión nuevamente.");
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers,
  });

  if (response.status === 401) {
    clearSession();
  }

  return response;
}

export async function apiFetchJson<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<{ data: T | null; response: Response }> {
  const response = await apiFetch(path, options);
  const data = (await response
    .json()
    .catch(() => null)) as T | null;
  return { data, response };
}
