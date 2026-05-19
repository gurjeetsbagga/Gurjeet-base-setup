import { cn } from "@/lib/utils";

export interface AnonymousCounterProps {
  remaining: number;
  total: number;
  className?: string;
}

/**
 * Small pill that shows the unauthenticated visitor how many preview
 * messages they have left. Designed to feel calm and informational, not
 * pressure-y — per Auryn product canon ("guided, not pushy").
 */
export function AnonymousCounter({ remaining, total, className }: AnonymousCounterProps) {
  const consumed = total - remaining;
  const isFinal = remaining <= 1;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft",
        isFinal && "border-warning/30 text-warning",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          remaining > 1 ? "bg-success" : remaining === 1 ? "bg-warning" : "bg-error",
        )}
      />
      <span>
        {consumed} of {total} preview messages used
      </span>
    </div>
  );
}
