"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { ChatConversationPanel } from "@/components/chat/chat-conversation-panel";
import { DashboardExploreGridShell } from "@/components/dashboard/dashboard-explore-grid-shell";
import { getDashboardPageMeta } from "@/lib/dashboard/page-meta";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";
import { useAuth } from "@/lib/auth/auth-provider";
import { useChat } from "@/lib/hooks/use-chat";
import { ExploreContextPanel } from "@/components/plan/explore-context-panel";
import type { PlanExplorePageData } from "@/lib/plan/types";

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

export function PlanExploreLayout({ data }: { data: PlanExplorePageData }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const meta = getDashboardPageMeta(pathname);
  const chat = useChat(null, { redirectOnCreate: false });

  const handleQuickAction = useCallback(
    (actionId: string) => {
      const action = data.context.quickActions.find((a) => a.id === actionId);
      if (action) void chat.sendMessage(action.label);
    },
    [chat, data.context.quickActions],
  );

  const handleItemSelect = useCallback(
    (itemId: string) => {
      const item = data.context.items.find((i) => i.id === itemId);
      if (item) void chat.sendMessage(item.title);
    },
    [chat, data.context.items],
  );

  return (
    <DashboardExploreGridShell
      breadcrumb={meta.breadcrumb}
      activeFocus={mockDashboardHomeData.sidebarFocus}
      userInitials={initialsFromUser(user?.email, user?.displayName ?? null)}
      center={
        <ChatConversationPanel
          testId="plan-explore-chat"
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
      right={
        <ExploreContextPanel
          context={data.context}
          onQuickAction={handleQuickAction}
          onItemSelect={handleItemSelect}
        />
      }
    />
  );
}
