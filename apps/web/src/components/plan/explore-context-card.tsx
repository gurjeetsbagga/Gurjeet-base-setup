import { ChevronRightIcon } from "@/components/plan/plan-icons";
import { exploreTopicToneStyles } from "@/lib/plan/context-tone";
import type { ExploreContextItem } from "@/lib/plan/types";
import { cn } from "@/lib/utils";

export function ExploreContextCard({
  item,
  onSelect,
  className,
}: {
  item: ExploreContextItem;
  onSelect?: (item: ExploreContextItem) => void;
  className?: string;
}) {
  const content = (
    <>
      <span
        className={cn("size-3 shrink-0 rounded-full", exploreTopicToneStyles[item.tone])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.title}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">{item.subtitle}</p>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left transition-colors hover:bg-muted/60",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-3 py-3", className)}
      data-testid="explore-context-card"
    >
      {content}
    </div>
  );
}
