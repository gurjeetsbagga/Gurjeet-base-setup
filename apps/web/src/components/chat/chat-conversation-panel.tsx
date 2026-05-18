"use client";

import { PlanMessageBubble } from "@/components/plan/plan-message-bubble";
import { ConversationalInputBar } from "@/components/dashboard/conversational-input-bar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TypingIndicator } from "./typing-indicator";
import type { PlanChatMessage } from "@/lib/plan/types";
import type { ChatMessage } from "./message-bubble";

function toPlanMessage(message: ChatMessage): PlanChatMessage | null {
  const role = String(message.role).toLowerCase();
  if (role === "system") return null;
  return {
    id: message.id,
    role: role === "user" ? "user" : "assistant",
    content: message.content,
  };
}

export interface ChatConversationPanelProps {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  showTyping: boolean;
  isLoadingHistory: boolean;
  showWelcomeOnly: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  error?: string | null;
  testId?: string;
}

export function ChatConversationPanel({
  messages,
  input,
  setInput,
  onSend,
  isSending,
  showTyping,
  isLoadingHistory,
  showWelcomeOnly,
  scrollRef,
  error,
  testId = "chat-explore-panel",
}: ChatConversationPanelProps) {
  const visibleMessages = messages
    .map(toPlanMessage)
    .filter((m): m is PlanChatMessage => m !== null);

  return (
    <Card
      className="flex min-h-[28rem] flex-col overflow-hidden border-border-subtle bg-surface shadow-soft lg:min-h-[calc(100dvh-11rem)]"
      data-testid={testId}
    >
      <div
        ref={scrollRef}
        className="chat-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 sm:px-8"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {isLoadingHistory ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading messages">
            <Skeleton className="ml-auto h-14 w-[min(85%,18rem)] rounded-2xl rounded-br-md" />
            <Skeleton className="h-16 w-[min(85%,22rem)] rounded-2xl rounded-bl-md" />
          </div>
        ) : showWelcomeOnly ? (
          <div className="flex flex-1 flex-col justify-center gap-4 py-8">
            <PlanMessageBubble
              message={{
                id: "welcome-assistant",
                role: "assistant",
                content:
                  "Hello — I'm Auryn. Ask me anything about your wellness, recovery, or daily habits.",
              }}
            />
          </div>
        ) : (
          visibleMessages.map((message) => <PlanMessageBubble key={message.id} message={message} />)
        )}
        {showTyping ? <TypingIndicator variant="explore" /> : null}
      </div>
      <div className="border-t border-border-subtle bg-surface px-4 py-4 sm:px-6">
        {error ? (
          <p className="mb-3 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        <ConversationalInputBar
          value={input}
          onChange={setInput}
          onSubmit={onSend}
          placeholder="Ask Auryn anything…"
          disabled={isSending}
        />
      </div>
    </Card>
  );
}
