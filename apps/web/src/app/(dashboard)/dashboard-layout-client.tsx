"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardPageMeta } from "@/lib/dashboard/page-meta";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";
import type { ReactNode } from "react";

function initialsFromUser(email?: string | null, displayName?: string | null): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AU";
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const data = mockDashboardHomeData;
  const meta = getDashboardPageMeta(pathname);

  return (
    <DashboardShell
      breadcrumb={meta.breadcrumb}
      activeFocus={data.sidebarFocus}
      userInitials={initialsFromUser(user?.email, user?.displayName ?? null)}
    >
      {children}
    </DashboardShell>
  );
}
