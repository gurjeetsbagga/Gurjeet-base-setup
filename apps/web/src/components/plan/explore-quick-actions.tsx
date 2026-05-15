import type { ExploreQuickAction } from "@/lib/plan/types";
import { cn } from "@/lib/utils";

export function ExploreQuickActions({
  prompt,
  actions,
  onAction,
  className,
}: {
  prompt: string;
  actions: ExploreQuickAction[];
  onAction?: (action: ExploreQuickAction) => void;
  className?: string;
}) {
  return (
    <div className={cn("mt-6 border-t border-border-subtle pt-6", className)}>
      <p className="text-sm text-muted-foreground">{prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction?.(action)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              action.variant === "primary"
                ? "bg-dashboard-brand text-auth-brand-foreground"
                : "bg-muted text-foreground hover:bg-muted/80",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
