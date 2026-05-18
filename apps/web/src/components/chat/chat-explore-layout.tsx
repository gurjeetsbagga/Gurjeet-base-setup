"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { DashboardExploreGridShell } from "@/components/dashboard/dashboard-explore-grid-shell";
import { getDashboardPageMeta } from "@/lib/dashboard/page-meta";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";
import { useAuth } from "@/lib/auth/auth-provider";
import { useChat } from "@/lib/hooks/use-chat";
import { ChatConversationPanel } from "./chat-conversation-panel";
import { ChatContextAside } from "./chat-context-aside";

function initialsFromUser(email?: string | null, displayName?: string | null): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AU";
}

export function ChatExploreLayout({ conversationId }: { conversationId?: string | null }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const meta = getDashboardPageMeta(pathname);
  const chat = useChat(conversationId);

  const handleQuick = useCallback(
    (label: string) => {
      void chat.sendMessage(label);
    },
    [chat],
  );

  const handleItem = useCallback(
    (title: string) => {
      void chat.sendMessage(title);
    },
    [chat],
  );

  return (
    <DashboardExploreGridShell
      breadcrumb={meta.breadcrumb}
      activeFocus={mockDashboardHomeData.sidebarFocus}
      userInitials={initialsFromUser(user?.email, user?.displayName ?? null)}
      center={
        <ChatConversationPanel
          messages={chat.messages}
          input={chat.input}
          setInput={chat.setInput}
          onSend={() => void chat.sendMessage()}
          isSending={chat.isSending}
          showTyping={chat.showTyping}
          isLoadingHistory={chat.isLoadingHistory}
          showWelcomeOnly={chat.showWelcomeOnly}
          scrollRef={chat.scrollRef}
          error={chat.error}
        />
      }
      right={<ChatContextAside onQuickAction={handleQuick} onItemSelect={handleItem} />}
    />
  );
}
