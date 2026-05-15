"use client";

import { useCallback, useState } from "react";
import { ConversationalInputBar } from "@/components/dashboard/conversational-input-bar";
import { PlanMessageBubble } from "@/components/plan/plan-message-bubble";
import { Card } from "@/components/ui/card";
import type { PlanChatMessage } from "@/lib/plan/types";
import { cn } from "@/lib/utils";

export function PlanExploreChat({
  initialMessages,
  className,
  onSend,
}: {
  initialMessages: PlanChatMessage[];
  className?: string;
  onSend?: (text: string) => void;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const submit = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const userMessage: PlanChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    onSend?.(trimmed);
  }, [draft, onSend]);

  return (
    <Card
      className={cn(
        "flex min-h-[28rem] flex-col overflow-hidden shadow-soft lg:min-h-[32rem]",
        className,
      )}
      data-testid="plan-explore-chat"
    >
      <div className="chat-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 sm:px-8">
        {messages.map((message) => (
          <PlanMessageBubble key={message.id} message={message} />
        ))}
      </div>
      <div className="border-t border-border-subtle bg-surface/90 px-4 py-4 sm:px-6">
        <ConversationalInputBar
          value={draft}
          onChange={setDraft}
          onSubmit={submit}
          placeholder="Ask Auryn anything…"
        />
      </div>
    </Card>
  );
}
