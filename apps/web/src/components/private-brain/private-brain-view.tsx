"use client";

import { useState } from "react";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { MemoryInsightPanel } from "@/components/private-brain/memory-insight-panel";
import { MemorySearchInput } from "@/components/private-brain/memory-search-input";
import { MemoryThreadsSection } from "@/components/private-brain/memory-threads-section";
import { MemoryToolsPanel } from "@/components/private-brain/memory-tools-panel";
import type { PrivateBrainPageData } from "@/lib/private-brain/types";

export function PrivateBrainView({ data }: { data: PrivateBrainPageData }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-8 pb-28 lg:gap-10">
      <DashboardSectionHeader
        title={data.title}
        subtitle={data.subtitle}
        action={<MemorySearchInput value={searchQuery} onChange={setSearchQuery} />}
      />

      <MemoryThreadsSection
        threads={data.threads}
        totalCount={data.threadCount}
        searchQuery={searchQuery}
      />

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
        aria-label="Memory insights and tools"
      >
        <MemoryInsightPanel insight={data.insight} className="lg:col-span-2" />
        <MemoryToolsPanel tools={data.tools} />
      </section>
    </div>
  );
}
