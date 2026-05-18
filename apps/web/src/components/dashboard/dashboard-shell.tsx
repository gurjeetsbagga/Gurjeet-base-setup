"use client";

import { useState, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardPromptBar } from "@/components/dashboard/dashboard-prompt-bar";
import type { ActiveFocusSummary } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

/** Default dashboard layout: white sidebar + scrollable main (home, recovery, settings, etc.) */
export function DashboardShell({
  children,
  breadcrumb,
  activeFocus,
  userInitials: _userInitials,
  hidePromptBar = false,
}: {
  children: ReactNode;
  breadcrumb: string;
  activeFocus: ActiveFocusSummary;
  userInitials?: string;
  hidePromptBar?: boolean;
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
          className="h-full border-r border-border-subtle shadow-elevated lg:shadow-none"
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

      <div className="flex min-w-0 flex-1 flex-col bg-dashboard-canvas">
        <div className="flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg px-2 py-2 text-sm text-muted-foreground"
          >
            Menu
          </button>
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-6">
          {breadcrumb ? (
            <p className="mb-5 text-caption font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {breadcrumb}
            </p>
          ) : null}
          {children}
        </main>
        {hidePromptBar ? null : <DashboardPromptBar />}
      </div>
    </div>
  );
}
