import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { vi } from "vitest";

vi.mock("@/lib/auth/auth-provider", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    user: {
      id: "test-user",
      email: "test@auryn.test",
      displayName: "Test User",
    },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

// @ts-expect-error — assign test defaults when env vars are unset
process.env.NODE_ENV ??= "test";
// @ts-expect-error — assign test defaults when env vars are unset
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:4000";
// @ts-expect-error — assign test defaults when env vars are unset
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  },
  configurable: true,
});
