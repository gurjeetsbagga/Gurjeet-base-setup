"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "Share what's on your mind…",
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled) onSend();
      }
    },
    [value, disabled, onSend],
  );

  return (
    <div
      className={cn(
        "border-t border-border-subtle bg-surface/80 backdrop-blur-sm px-4 py-4 safe-area-pb",
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[48px] max-h-32 resize-none py-3"
          aria-label="Message to Auryn"
        />
        <Button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="shrink-0"
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
