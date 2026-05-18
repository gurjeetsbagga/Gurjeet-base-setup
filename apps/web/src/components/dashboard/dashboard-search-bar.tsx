"use client";

import { SearchIcon } from "@/components/dashboard/dashboard-icons";
import { cn } from "@/lib/utils";

export function DashboardSearchBar({ className }: { className?: string }) {
  return (
    <label className={cn("relative flex w-full max-w-xl items-center", className)}>
      <SearchIcon className="pointer-events-none absolute left-4 size-5 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search, ask, or explore..."
        className="h-10 w-full rounded-full border border-border-subtle bg-muted/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/25"
        aria-label="Search, ask, or explore"
      />
    </label>
  );
}
