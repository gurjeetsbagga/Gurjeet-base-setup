import { AurynLogoMark } from "@/components/dashboard/dashboard-icons";
import type { PlanChatMessage } from "@/lib/plan/types";
import { cn } from "@/lib/utils";

export function PlanMessageBubble({ message }: { message: PlanChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
      data-role={message.role}
      data-testid="plan-message"
    >
      {!isUser ? <AurynLogoMark className="size-8 shrink-0" /> : null}
      <p
        className={cn(
          "max-w-[min(85%,28rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-dashboard-brand-muted text-foreground"
            : "rounded-bl-md border border-border-subtle bg-surface text-foreground shadow-[var(--shadow-soft)]",
        )}
      >
        {message.content}
      </p>
    </div>
  );
}
