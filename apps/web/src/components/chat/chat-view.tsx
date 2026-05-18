"use client";

import { ChatExploreLayout } from "./chat-explore-layout";

/** @deprecated Use ChatExploreLayout — kept for tests and gradual migration */
export function ChatView({ conversationId }: { conversationId?: string | null }) {
  return <ChatExploreLayout conversationId={conversationId} />;
}
