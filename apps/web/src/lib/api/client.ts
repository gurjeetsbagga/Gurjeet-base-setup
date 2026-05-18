import { env } from "@/lib/env";
import type { ApiErrorBody } from "./types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export type GetAccessToken = () => string | null;

let getAccessToken: GetAccessToken = () => null;

export function setAccessTokenGetter(fn: GetAccessToken): void {
  getAccessToken = fn;
}

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiPath = `/api/v1${normalized}`;

  // Browser: same-origin via Next.js rewrite (next.config → backend). Avoids CORS and
  // localhost vs 127.0.0.1 mismatches when the API is on a different port.
  if (typeof window !== "undefined") {
    return apiPath;
  }

  const base = env.API_URL.replace(/\/$/, "");
  return `${base}${apiPath}`;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!init?.skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), { ...init, headers });

  if (!res.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      /* empty */
    }
    const msg =
      body?.error?.message != null
        ? Array.isArray(body.error.message)
          ? body.error.message.join(", ")
          : body.error.message
        : res.statusText;
    throw new ApiClientError(msg, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * Streaming-ready fetch for future SSE / chunked responses.
 * Returns the raw Response so callers can read body.getReader().
 */
export async function apiStreamRequest(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "text/event-stream");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(buildUrl(path), { ...init, headers });
  if (!res.ok) {
    throw new ApiClientError(res.statusText, res.status);
  }
  return res;
}
