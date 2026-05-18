import { ApiClientError, apiRequest } from "./client";
import { clearTokens } from "@/lib/auth/session";
import type { ApiResponse, AuthTokens, AuthUser, LoginPayload, RegisterPayload } from "./types";

export async function login(payload: LoginPayload): Promise<AuthTokens & { user?: AuthUser }> {
  const res = await apiRequest<ApiResponse<AuthTokens & { user?: AuthUser }>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return res.data;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthTokens & { user?: AuthUser }> {
  const res = await apiRequest<ApiResponse<AuthTokens & { user?: AuthUser }>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return res.data;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiRequest<ApiResponse<AuthUser | null>>("/auth/me");
    return res.data;
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) {
      clearTokens();
    }
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/auth/logout", { method: "POST" });
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const res = await apiRequest<ApiResponse<{ message: string }>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
  return res.data;
}

export async function resetPassword(payload: {
  password: string;
  token?: string;
  accessToken?: string;
}): Promise<{ message: string }> {
  const res = await apiRequest<ApiResponse<{ message: string }>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return res.data;
}
