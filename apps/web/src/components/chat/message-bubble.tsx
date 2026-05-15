"use client";

import { cn } from "@/lib/utils";
import type { MessageRole } from "@/lib/api/types";
import { Avatar } from "@/components/ui/avatar";
import { MessageContent } from "./message-content";

export interface ChatMessage {
  id: string;
  role: MessageRole | "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}

function normalizeRole(role: ChatMessage["role"]): "user" | "assistant" | "system" {
  const r = String(role).toUpperCase();
  if (r === "USER") return "user";
  if (r === "SYSTEM") return "system";
  return "assistant";
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const role = normalizeRole(message.role);
  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center px-4 py-2" role="note">
        <p className="max-w-lg rounded-xl bg-chat-system px-4 py-2 text-center text-xs text-muted-foreground">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-3 px-4 py-2", isUser ? "flex-row-reverse" : "flex-row")}
      data-role={role}
    >
      {!isUser && <Avatar label="A" size="sm" />}
      <div
        className={cn(
          "max-w-[min(85%,32rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-soft)]",
          isUser
            ? "rounded-br-md bg-chat-user text-chat-user-foreground"
            : "rounded-bl-md border border-border-subtle bg-chat-assistant text-chat-assistant-foreground",
        )}
      >
        <MessageContent content={message.content || (message.isStreaming ? " " : "")} />
        {message.isStreaming && !message.content && (
          <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary/60 animate-pulse" aria-hidden />
        )}
      </div>
    </div>
  );
}
