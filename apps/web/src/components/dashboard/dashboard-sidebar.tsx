"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AurynLogoMark, NavIcon } from "@/components/dashboard/dashboard-icons";
import { DASHBOARD_WORKSPACE_NAV } from "@/lib/dashboard/config";
import type { ActiveFocusSummary } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  activeFocus,
  onNavigate,
  className,
}: {
  activeFocus: ActiveFocusSummary;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-border-subtle bg-surface",
        className,
      )}
      aria-label="Workspace"
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <AurynLogoMark className="size-9" />
        <span className="text-lg font-semibold text-dashboard-brand">Hey Auryn</span>
      </div>

      <nav className="flex-1 px-3" aria-label="Workspace navigation">
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
                        ? pathname.startsWith("/plan")
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
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <NavIcon name={item.icon} className="size-5 shrink-0" />
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
        <div className="mt-3 rounded-2xl border border-border-subtle bg-dashboard-brand-muted/50 p-4">
          <p className="text-sm font-semibold text-foreground">{activeFocus.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{activeFocus.subtitle}</p>
        </div>
      </div>
    </aside>
  );
}
