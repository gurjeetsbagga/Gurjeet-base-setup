"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  loading,
  id,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/40 focus-visible:ring-offset-2",
        checked ? "bg-dashboard-brand" : "bg-muted",
        isDisabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 translate-x-1 rounded-full bg-surface shadow-soft transition-transform",
          checked && "translate-x-6",
          loading && "opacity-70",
        )}
        aria-hidden
      />
    </button>
  );
}
