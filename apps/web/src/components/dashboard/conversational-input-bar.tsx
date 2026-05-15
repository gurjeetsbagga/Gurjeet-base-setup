"use client";

import type { KeyboardEvent } from "react";
import { ArrowUpIcon, PlusIcon } from "@/components/dashboard/dashboard-icons";
import { cn } from "@/lib/utils";

export function ConversationalInputBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Auryn anything…",
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-2 shadow-elevated",
        className,
      )}
    >
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Add attachment"
      >
        <PlusIcon className="size-5" />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-50"
        aria-label={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dashboard-brand text-auth-brand-foreground transition-opacity disabled:opacity-40"
        aria-label="Send to Auryn"
      >
        <ArrowUpIcon className="size-5" />
      </button>
    </div>
  );
}
