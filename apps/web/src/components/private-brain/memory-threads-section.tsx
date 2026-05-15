"use client";

import { useMemo, useState } from "react";
import { MemorySortSelect } from "@/components/private-brain/memory-sort-select";
import { MemoryThreadCard } from "@/components/private-brain/memory-thread-card";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { filterMemoryThreads, sortMemoryThreads } from "@/lib/private-brain/filter-threads";
import type { MemorySortOption, MemoryThread } from "@/lib/private-brain/types";
import { cn } from "@/lib/utils";

export function MemoryThreadsSection({
  threads,
  totalCount,
  searchQuery,
  className,
}: {
  threads: MemoryThread[];
  totalCount: number;
  searchQuery: string;
  className?: string;
}) {
  const [sort, setSort] = useState<MemorySortOption>("newest");
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const visible = useMemo(() => {
    const filtered = filterMemoryThreads(threads, debouncedQuery);
    return sortMemoryThreads(filtered, sort);
  }, [threads, debouncedQuery, sort]);

  return (
    <section
      className={cn("flex flex-col gap-4", className)}
      aria-labelledby="memory-threads-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="memory-threads-heading" className="text-h3 font-semibold text-foreground">
            Your Memory Threads
          </h2>
          <span
            className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-caption font-semibold text-muted-foreground"
            aria-label={`${totalCount} memory threads`}
          >
            {totalCount}
          </span>
        </div>
        <MemorySortSelect value={sort} onChange={setSort} />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-subtle bg-surface/60 px-6 py-12 text-center text-sm text-muted-foreground">
          No memory threads match your search. Try different words — Auryn remembers context, not
          just keywords.
        </p>
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          role="list"
          data-testid="memory-threads-grid"
        >
          {visible.map((thread) => (
            <li key={thread.id}>
              <MemoryThreadCard thread={thread} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
