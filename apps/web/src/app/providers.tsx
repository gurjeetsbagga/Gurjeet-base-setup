"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { AuthProvider } from "@/lib/auth/auth-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}
