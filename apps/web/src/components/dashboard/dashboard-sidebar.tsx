"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AurynLogoMark } from "@/components/dashboard/dashboard-icons";
import { DASHBOARD_WORKSPACE_NAV } from "@/lib/dashboard/config";
import type { ActiveFocusSummary } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

function WorkspaceNavDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        active ? "bg-dashboard-brand ring-[3px] ring-dashboard-brand/20" : "bg-muted-foreground/35",
      )}
      aria-hidden
    />
  );
}

export function DashboardSidebar({
  activeFocus,
  onNavigate,
  onMenuToggle,
  className,
}: {
  activeFocus: ActiveFocusSummary;
  onNavigate?: () => void;
  onMenuToggle?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn("flex h-full w-full flex-col bg-surface", className)}
      aria-label="Workspace"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-5">
        {onMenuToggle ? (
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg px-1 py-1 text-muted-foreground lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
        ) : null}
        <Link
          href="/dashboard"
          className="flex min-w-0 flex-1 items-center gap-2.5"
          onClick={onNavigate}
        >
          <AurynLogoMark className="size-8 shrink-0" />
          <span className="truncate text-lg font-semibold text-foreground">Hey Auryn</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 pt-4" aria-label="Workspace navigation">
        <p className="px-3 text-caption font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        <ul className="mt-3 flex flex-col gap-0.5" role="list">
          {DASHBOARD_WORKSPACE_NAV.map((item) => {
            const active =
              item.id === "overview"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : item.id === "health"
                  ? pathname.startsWith("/dashboard/health")
                  : item.id === "private-brain"
                    ? pathname.startsWith("/private-brain")
                    : item.id === "recovery"
                      ? pathname.startsWith("/recovery")
                      : item.id === "plan"
                        ? pathname.startsWith("/plan") || pathname.startsWith("/chat")
                        : item.id === "settings"
                          ? pathname.startsWith("/settings")
                          : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/40",
                    active
                      ? "bg-dashboard-brand-muted text-dashboard-brand"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <WorkspaceNavDot active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-4">
        <p className="text-caption font-semibold uppercase tracking-widest text-muted-foreground">
          Active focus
        </p>
        <div className="mt-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-soft">
          <p className="text-sm font-semibold text-foreground">{activeFocus.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{activeFocus.subtitle}</p>
        </div>
      </div>
    </aside>
  );
}
