"use client";

import { useState, type ReactNode } from "react";
import { DashboardSearchBar } from "@/components/dashboard/dashboard-search-bar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopNav } from "@/components/dashboard/dashboard-top-nav";
import type { ActiveFocusSummary } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

/**
 * Figma-aligned 3-column explore layout:
 * - Left: Hey Auryn + workspace (white), full height
 * - Top (chat + context): search centered, nav + avatar on the right
 * - Center: chat / main content
 * - Right: context panel
 */
export function DashboardExploreGridShell({
  breadcrumb,
  activeFocus,
  userInitials,
  center,
  right,
}: {
  breadcrumb: string;
  activeFocus: ActiveFocusSummary;
  userInitials?: string;
  center: ReactNode;
  right: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={cn(
        "dashboard-canvas grid h-dvh overflow-hidden",
        "grid-cols-1 grid-rows-[auto_1fr]",
        "lg:grid-cols-[var(--width-dashboard-sidebar)_minmax(0,1fr)_var(--width-dashboard-context-panel)]",
        "lg:grid-rows-[4.25rem_1fr]",
      )}
    >
      {/* Sidebar — full height */}
      <div
        className={cn(
          "fixed bottom-0 left-0 z-40 w-[var(--width-dashboard-sidebar)] bg-surface transition-transform lg:static lg:z-auto",
          "top-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <DashboardSidebar
          activeFocus={activeFocus}
          onNavigate={() => setSidebarOpen(false)}
          onMenuToggle={() => setSidebarOpen(true)}
          className="h-full border-r border-border-subtle"
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

      {/* Desktop header — spans chat + context (matches Figma top bar) */}
      <header className="hidden items-center gap-6 border-b border-border-subtle bg-surface px-5 lg:col-span-2 lg:col-start-2 lg:row-start-1 lg:flex lg:px-6 xl:px-8">
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <DashboardSearchBar className="max-w-[min(100%,36rem)]" />
        </div>
        <DashboardTopNav userInitials={userInitials} />
      </header>

      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg px-2 py-2 text-sm text-muted-foreground"
          aria-label="Open workspace menu"
        >
          Menu
        </button>
        <div className="min-w-0 flex-1">
          <DashboardSearchBar className="max-w-none" />
        </div>
      </div>

      {/* Center column — chat */}
      <main className="min-w-0 overflow-y-auto bg-dashboard-canvas px-4 py-5 lg:col-start-2 lg:row-start-2 lg:px-6 lg:py-6">
        {breadcrumb ? (
          <p className="mb-5 text-caption font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {breadcrumb}
          </p>
        ) : null}
        {center}
      </main>

      {/* Right column — context */}
      <aside className="hidden min-w-0 overflow-y-auto bg-dashboard-canvas px-4 py-5 lg:col-start-3 lg:row-start-2 lg:block lg:px-5 lg:py-6 xl:px-6">
        {right}
      </aside>
    </div>
  );
}
