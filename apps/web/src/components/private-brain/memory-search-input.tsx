"use client";

import { SearchIcon } from "@/components/dashboard/dashboard-icons";
import { cn } from "@/lib/utils";

export function MemorySearchInput({
  value,
  onChange,
  placeholder = "Search your memories…",
  className,
  id = "memory-search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  return (
    <label className={cn("relative block w-full sm:min-w-[16rem] sm:max-w-xs", className)}>
      <SearchIcon
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-full border border-border-subtle bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/30"
        aria-label={placeholder}
      />
    </label>
  );
}
