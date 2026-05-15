"use client";

import { useState, type ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPromptBar } from "@/components/dashboard/dashboard-prompt-bar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import type { ActiveFocusSummary } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  breadcrumb,
  activeFocus,
  userInitials,
}: {
  children: ReactNode;
  breadcrumb: string;
  activeFocus: ActiveFocusSummary;
  userInitials?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-canvas flex h-dvh overflow-hidden">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[var(--width-dashboard-sidebar)] transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <DashboardSidebar
          activeFocus={activeFocus}
          onNavigate={() => setSidebarOpen(false)}
          className="h-full shadow-elevated lg:shadow-none"
        />
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          aria-label="Close workspace menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          breadcrumb={breadcrumb}
          userInitials={userInitials}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">{children}</main>
        <DashboardPromptBar />
      </div>
    </div>
  );
}
