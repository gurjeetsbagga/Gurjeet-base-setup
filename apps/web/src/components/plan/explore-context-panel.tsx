"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ExploreContextCard } from "@/components/plan/explore-context-card";
import { ExploreQuickActions } from "@/components/plan/explore-quick-actions";
import type { ExploreContextPanelData } from "@/lib/plan/types";
import { cn } from "@/lib/utils";

export function ExploreContextPanel({
  context,
  onItemSelect,
  onQuickAction,
  className,
}: {
  context: ExploreContextPanelData;
  onItemSelect?: (id: string) => void;
  onQuickAction?: (id: string) => void;
  className?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(context.items[0]?.id ?? null);

  return (
    <Card
      className={cn(
        "flex flex-col border-border-subtle bg-surface p-6 shadow-soft sm:p-7",
        className,
      )}
      data-testid="explore-context-panel"
    >
      <h2 className="text-h3 font-semibold text-foreground">{context.title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5" role="list">
        {context.items.map((item) => (
          <li key={item.id}>
            <ExploreContextCard
              item={item}
              selected={selectedId === item.id}
              onSelect={() => {
                setSelectedId(item.id);
                onItemSelect?.(item.id);
              }}
            />
          </li>
        ))}
      </ul>
      <ExploreQuickActions
        prompt={context.prompt}
        actions={context.quickActions}
        onAction={onQuickAction ? (a) => onQuickAction(a.id) : undefined}
      />
    </Card>
  );
}
