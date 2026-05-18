"use client";

import { AurynLogoMark } from "@/components/dashboard/dashboard-icons";
import { cn } from "@/lib/utils";

export function TypingIndicator({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "explore";
}) {
  if (variant === "explore") {
    return (
      <div
        className={cn("flex gap-3 px-1 py-1", className)}
        role="status"
        aria-label="Auryn is typing"
      >
        <AurynLogoMark className="size-8 shrink-0" />
        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border-subtle bg-surface px-4 py-3 shadow-[var(--shadow-soft)]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-muted-foreground/40 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1 px-4 py-3", className)}
      role="status"
      aria-label="Auryn is typing"
    >
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 rounded-full bg-muted-foreground/40 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
