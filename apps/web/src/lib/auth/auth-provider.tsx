"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAccessTokenGetter } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/lib/api/types";
import { saveReturningUserProfile } from "./returning-user";
import {
  clearTokens,
  getAccessToken,
  hasUsableAccessToken,
  setTokens,
  syncSessionCookie,
} from "./session";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAccessTokenGetter(getAccessToken);
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!hasUsableAccessToken()) {
      setUser(null);
      return null;
    }
    const me = await authApi.getCurrentUser();
    setUser(me);
    if (!me) clearTokens();
    return me;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (hasUsableAccessToken()) {
          syncSessionCookie();
          const me = await authApi.getCurrentUser();
          if (!cancelled) {
            setUser(me);
            if (!me) clearTokens();
          }
        } else if (getAccessToken()) {
          clearTokens();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistReturningProfile = useCallback(
    (email: string, profileUser?: AuthUser | null, fallbackName?: string | null) => {
      saveReturningUserProfile({
        email,
        displayName: profileUser?.displayName ?? fallbackName,
      });
    },
    [],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      if (result.accessToken) setTokens(result.accessToken, result.refreshToken);
      const nextUser = result.user ?? { id: "", email: payload.email };
      setUser(nextUser);
      const me = await refreshUser();
      persistReturningProfile(payload.email, me ?? nextUser);
    },
    [persistReturningProfile, refreshUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authApi.register(payload);
      if (result.accessToken) setTokens(result.accessToken, result.refreshToken);
      const nextUser = result.user ?? {
        id: "",
        email: payload.email,
        displayName: payload.displayName,
      };
      setUser(nextUser);
      const me = await refreshUser();
      persistReturningProfile(payload.email, me ?? nextUser, payload.displayName);
    },
    [persistReturningProfile, refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* session may already be invalid */
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
