"use client";

import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { DisclaimerBanner } from "./disclaimer-banner";
import { useChat } from "@/lib/hooks/use-chat";

export function ChatView({ conversationId }: { conversationId?: string | null }) {
  const { messages, input, setInput, sendMessage, isSending, showTyping, scrollRef } =
    useChat(conversationId);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="chat-scroll flex-1 overflow-y-auto py-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {showTyping && (
            <div className="px-4">
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} disabled={isSending} />
      <DisclaimerBanner />
    </div>
  );
}
