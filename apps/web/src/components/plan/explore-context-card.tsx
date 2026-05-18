import { ChevronRightIcon } from "@/components/plan/plan-icons";
import { exploreTopicToneStyles } from "@/lib/plan/context-tone";
import type { ExploreContextItem } from "@/lib/plan/types";
import { cn } from "@/lib/utils";

export function ExploreContextCard({
  item,
  selected = false,
  onSelect,
  className,
}: {
  item: ExploreContextItem;
  selected?: boolean;
  onSelect?: (item: ExploreContextItem) => void;
  className?: string;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "size-3.5 shrink-0 rounded-full",
          exploreTopicToneStyles[item.tone],
          selected && "ring-2 ring-offset-2 ring-dashboard-brand/40",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.title}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">{item.subtitle}</p>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </>
  );

  const cardClass = cn(
    "flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-left shadow-soft transition-colors",
    selected && "border-dashboard-brand/30 bg-dashboard-brand-muted/30",
    !selected && "hover:border-border hover:bg-muted/30",
    className,
  );

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(item)} className={cardClass}>
        {inner}
      </button>
    );
  }

  return (
    <div className={cardClass} data-testid="explore-context-card">
      {inner}
    </div>
  );
}
