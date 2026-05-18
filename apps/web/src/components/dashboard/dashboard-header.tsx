"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AurynLogoMark, SearchIcon } from "@/components/dashboard/dashboard-icons";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { DASHBOARD_TOP_TABS } from "@/lib/dashboard/config";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  userInitials = "MA",
  onMenuToggle,
}: {
  userInitials?: string;
  onMenuToggle?: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="shrink-0 border-b border-border-subtle bg-surface">
      <div className="flex h-[4.25rem] items-center gap-3 px-4 lg:gap-5 lg:px-6">
        {onMenuToggle ? (
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open workspace menu"
          >
            Menu
          </button>
        ) : null}

        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/40 rounded-lg"
        >
          <AurynLogoMark className="size-8 lg:size-9" />
          <span className="hidden text-lg font-semibold text-foreground sm:inline">Hey Auryn</span>
        </Link>

        <label className="relative mx-1 flex min-w-0 flex-1 items-center lg:mx-4 lg:max-w-xl xl:max-w-2xl">
          <SearchIcon className="pointer-events-none absolute left-4 size-5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search, ask, or explore..."
            className="h-10 w-full rounded-full border border-border-subtle bg-muted/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/25"
            aria-label="Search, ask, or explore"
          />
        </label>

        <nav className="hidden shrink-0 items-center gap-5 lg:flex xl:gap-7" aria-label="Primary">
          {DASHBOARD_TOP_TABS.map((tab) => {
            const active =
              tab.id === "dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : tab.id === "private-brain"
                  ? pathname.startsWith("/private-brain")
                  : tab.id === "plans"
                    ? pathname.startsWith("/plan")
                    : tab.id === "messages"
                      ? pathname.startsWith("/chat")
                      : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <DashboardUserMenu userInitials={userInitials} />
      </div>
    </header>
  );
}
