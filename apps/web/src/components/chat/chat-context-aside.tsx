"use client";

import { ExploreContextPanel } from "@/components/plan/explore-context-panel";
import { mockPlanExploreData } from "@/lib/plan/mock-data";

export function ChatContextAside({
  onQuickAction,
  onItemSelect,
}: {
  onQuickAction?: (label: string) => void;
  onItemSelect?: (title: string) => void;
}) {
  const context = mockPlanExploreData.context;

  return (
    <ExploreContextPanel
      context={context}
      onQuickAction={(actionId) => {
        const action = context.quickActions.find((a) => a.id === actionId);
        if (action) onQuickAction?.(action.label);
      }}
      onItemSelect={(id) => {
        const item = context.items.find((i) => i.id === id);
        if (item) onItemSelect?.(item.title);
      }}
    />
  );
}
