"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConversationalInputBar } from "@/components/dashboard/conversational-input-bar";
import { cn } from "@/lib/utils";

const HIDE_PROMPT_PATHS = ["/plan"];

export function DashboardPromptBar({
  placeholder = "Ask Auryn anything…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const [value, setValue] = useState("");
  const router = useRouter();

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ q: trimmed });
    router.push(`/chat?${params.toString()}`);
  }, [value, router]);

  if (HIDE_PROMPT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4 pt-8",
        "bg-gradient-to-t from-dashboard-canvas via-dashboard-canvas/95 to-transparent",
        className,
      )}
    >
      <div className="pointer-events-auto w-full max-w-[var(--width-dashboard-prompt)]">
        <ConversationalInputBar
          value={value}
          onChange={setValue}
          onSubmit={submit}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
