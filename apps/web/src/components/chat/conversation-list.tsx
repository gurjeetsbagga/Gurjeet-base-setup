"use client";

import Link from "next/link";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/lib/api/types";

export interface ConversationListItem {
  id: string;
  title: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
}

export function ConversationList({
  conversations,
  activeId,
  onNewChat,
}: {
  conversations: ConversationListItem[];
  activeId?: string | null;
  onNewChat: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Conversation history">
      <button
        type="button"
        onClick={onNewChat}
        className="mb-2 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-95"
      >
        New conversation
      </button>
      {conversations.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">No conversations yet.</p>
      ) : (
        conversations.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className={cn(
              "block rounded-xl px-3 py-2.5 text-left transition-colors",
              activeId === c.id
                ? "bg-primary-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="line-clamp-1 text-sm font-medium">
              {c.title ?? "New conversation"}
            </span>
            <span className="mt-0.5 block text-xs opacity-70">
              {formatRelativeTime(c.lastMessageAt ?? c.updatedAt)}
            </span>
          </Link>
        ))
      )}
    </nav>
  );
}

export function toListItem(c: Conversation): ConversationListItem {
  return {
    id: c.id,
    title: c.title,
    lastMessageAt: c.lastMessageAt,
    updatedAt: c.updatedAt,
  };
}
