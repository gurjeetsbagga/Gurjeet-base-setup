"use client";

import { cn } from "@/lib/utils";
import type { MemorySortOption } from "@/lib/private-brain/types";

const SORT_LABELS: Record<MemorySortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  relevance: "Relevance",
  importance: "Importance",
};

export function MemorySortSelect({
  value,
  onChange,
  className,
}: {
  value: MemorySortOption;
  onChange: (value: MemorySortOption) => void;
  className?: string;
}) {
  return (
    <label
      className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
    >
      <span className="sr-only">Sort memory threads</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MemorySortOption)}
        className="cursor-pointer rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/30"
        aria-label="Sort memory threads"
      >
        {(Object.keys(SORT_LABELS) as MemorySortOption[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </label>
  );
}
