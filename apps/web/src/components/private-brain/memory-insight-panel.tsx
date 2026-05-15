import { Card } from "@/components/ui/card";
import type { MemoryInsightContent } from "@/lib/private-brain/types";
import { cn } from "@/lib/utils";

export function MemoryInsightPanel({
  insight,
  className,
}: {
  insight: MemoryInsightContent;
  className?: string;
}) {
  return (
    <Card
      className={cn("relative overflow-hidden p-8 md:p-10", className)}
      data-testid="memory-insight-panel"
    >
      <div
        className="pointer-events-none absolute -right-8 top-4 size-32 rounded-full bg-memory-sleep/40 blur-sm"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-16 top-12 size-20 rounded-full bg-memory-research/30 blur-sm"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-6 right-24 size-14 rounded-full bg-memory-family/25 blur-sm"
        aria-hidden
      />
      <p className="relative max-w-md text-h2 font-semibold leading-snug text-foreground">
        {insight.headline}
      </p>
      {insight.body ? (
        <p className="relative mt-3 max-w-lg text-sm text-muted-foreground">{insight.body}</p>
      ) : null}
    </Card>
  );
}
