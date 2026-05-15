import { recoveryFocusStatusStyles } from "@/lib/recovery/focus-status";
import type { RecoveryFocusState } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

export function RecoveryFocusBadge({
  focus,
  className,
}: {
  focus: RecoveryFocusState;
  className?: string;
}) {
  const styles = recoveryFocusStatusStyles[focus.status];

  return (
    <p
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium",
        styles.badge,
        className,
      )}
      data-testid="recovery-focus-badge"
    >
      <span className="text-muted-foreground">Active Focus:</span>
      <span className="ml-1.5 font-semibold">
        {focus.phaseLabel} — {focus.statusLabel}
      </span>
    </p>
  );
}
