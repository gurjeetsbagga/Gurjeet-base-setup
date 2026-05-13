import { env } from "./env";

/**
 * Thin fetch wrapper for the Auryn API.
 * Extend with auth headers, error handling, and typed responses
 * as endpoints are implemented.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${env.API_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
