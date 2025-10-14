const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser<T = any>(): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveSession(user: any, token: string) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      const parsed = typeof user === "string" ? JSON.parse(user) : { ...user };
      updateStoredUser({ ...parsed, access_token: token, token_type: parsed?.token_type });
    }
  } catch {
    // ignore
  }
}

export function updateStoredUser(user: any) {
  if (!isBrowser()) return;
  try {
    const token = getStoredToken();
    const previous = getStoredUser<any>() || {};
    const parsed = typeof user === "string" ? JSON.parse(user) : { ...user };
    if (token && parsed && typeof parsed === "object") {
      parsed.access_token = parsed.access_token || token;
    }
    if (parsed && typeof parsed === "object" && previous?.token_type && !parsed.token_type) {
      parsed.token_type = previous.token_type;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(parsed ?? {}));
  } catch {
    // ignore
  }
}

export function clearSession() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}
