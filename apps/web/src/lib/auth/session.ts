import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./session-cookie";

const ACCESS_TOKEN_KEY = "auryn_access_token";
const REFRESH_TOKEN_KEY = "auryn_refresh_token";

export { SESSION_COOKIE_NAME } from "./session-cookie";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Best-effort JWT expiry check (no signature verification — client hint only). */
export function isAccessTokenExpired(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const segment = parts[1];
    if (!segment) return false;
    const payload = JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return false;
  }
}

/** Token present and not past expiry (avoids noisy /auth/me 401s on boot). */
export function hasUsableAccessToken(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  if (isAccessTokenExpired(token)) {
    clearTokens();
    return false;
  }
  return true;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function syncSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  syncSessionCookie();
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearSessionCookie();
}

export function isAuthenticated(): boolean {
  return hasUsableAccessToken();
}
