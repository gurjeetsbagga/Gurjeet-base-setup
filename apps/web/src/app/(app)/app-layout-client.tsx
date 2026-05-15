"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { toListItem, type ConversationListItem } from "@/components/chat/conversation-list";
import * as conversationsApi from "@/lib/api/conversations";
import { getAccessToken } from "@/lib/auth/session";

function conversationIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/chat\/([^/]+)$/);
  return match?.[1] ?? null;
}

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeConversationId = conversationIdFromPath(pathname);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);

  const loadConversations = useCallback(async () => {
    if (!getAccessToken()) {
      setConversations([]);
      return;
    }
    try {
      const list = await conversationsApi.listConversations();
      setConversations(list.map(toListItem));
    } catch {
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, pathname]);

  const onNewChat = useCallback(() => {
    router.push("/chat");
  }, [router]);

  return (
    <AppShell
      conversations={conversations}
      activeConversationId={activeConversationId}
      onNewChat={onNewChat}
    >
      {children}
    </AppShell>
  );
}
