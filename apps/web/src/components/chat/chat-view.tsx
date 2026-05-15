"use client";

import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { DisclaimerBanner } from "./disclaimer-banner";
import { ChatHeader } from "./chat-header";
import { ChatEmptyState } from "./chat-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/lib/hooks/use-chat";

export function ChatView({ conversationId }: { conversationId?: string | null }) {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isSending,
    showTyping,
    isLoadingHistory,
    showWelcomeOnly,
    scrollRef,
  } = useChat(conversationId);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <ChatHeader />
      <div
        ref={scrollRef}
        className="chat-scroll flex-1 overflow-y-auto py-4 md:py-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
          {isLoadingHistory ? (
            <div className="space-y-4 px-4" aria-busy="true" aria-label="Loading messages">
              <Skeleton className="ml-auto h-16 w-2/3 max-w-sm" />
              <Skeleton className="h-20 w-4/5 max-w-md" />
              <Skeleton className="ml-auto h-12 w-1/2 max-w-xs" />
            </div>
          ) : showWelcomeOnly ? (
            <ChatEmptyState onSuggestion={(text) => void sendMessage(text)} />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {showTyping && (
            <div className="px-4">
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => void sendMessage()}
        disabled={isSending}
      />
      <DisclaimerBanner />
    </div>
  );
}
