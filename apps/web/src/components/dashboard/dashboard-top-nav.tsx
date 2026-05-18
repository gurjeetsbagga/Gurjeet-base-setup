"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { DASHBOARD_TOP_TABS } from "@/lib/dashboard/config";
import { cn } from "@/lib/utils";

export function DashboardTopNav({
  userInitials = "MA",
  className,
}: {
  userInitials?: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("flex shrink-0 items-center gap-4 lg:gap-6 xl:gap-8", className)}>
      <nav className="flex items-center gap-4 lg:gap-6 xl:gap-8" aria-label="Primary">
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
                "whitespace-nowrap text-sm transition-colors",
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
  );
}
