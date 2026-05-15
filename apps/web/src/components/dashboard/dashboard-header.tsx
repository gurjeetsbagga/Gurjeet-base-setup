"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon } from "@/components/dashboard/dashboard-icons";
import { Avatar } from "@/components/ui/avatar";
import { DASHBOARD_TOP_TABS } from "@/lib/dashboard/config";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  breadcrumb,
  userInitials = "MA",
  onMenuToggle,
}: {
  breadcrumb: string;
  userInitials?: string;
  onMenuToggle?: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border-subtle bg-surface/90 backdrop-blur-sm">
      <div className="flex flex-col gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenuToggle ? (
            <button
              type="button"
              onClick={onMenuToggle}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Open workspace menu"
            >
              Menu
            </button>
          ) : null}
          <label className="relative flex min-w-0 flex-1 items-center">
            <SearchIcon className="pointer-events-none absolute left-4 size-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search, ask, or explore..."
              className="h-11 w-full rounded-full border border-border-subtle bg-muted/60 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/30"
              aria-label="Search, ask, or explore"
            />
          </label>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {DASHBOARD_TOP_TABS.map((tab) => {
              const active =
                tab.id === "dashboard"
                  ? pathname === "/dashboard" || pathname === "/dashboard/"
                  : tab.id === "private-brain"
                    ? pathname.startsWith("/private-brain")
                    : tab.id === "plans"
                      ? pathname.startsWith("/plan")
                      : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "pb-0.5 text-sm font-medium transition-colors",
                    active
                      ? "border-b-2 border-dashboard-brand text-dashboard-brand"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <Avatar
            label={userInitials}
            size="lg"
            className="bg-dashboard-brand-muted text-dashboard-brand"
          />
        </div>
        <p className="text-caption font-medium uppercase tracking-widest text-muted-foreground">
          {breadcrumb}
        </p>
      </div>
    </header>
  );
}
