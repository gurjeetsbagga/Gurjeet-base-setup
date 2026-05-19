"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { ANONYMOUS_CHAT } from "@auryn/config/limits";
import { DashboardExploreGridShell } from "@/components/dashboard/dashboard-explore-grid-shell";
import { LoginGateModal } from "@/components/auth/login-gate-modal";
import { getDashboardPageMeta } from "@/lib/dashboard/page-meta";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";
import { useAuth } from "@/lib/auth/auth-provider";
import { useChat } from "@/lib/hooks/use-chat";
import { useAnonymousChat } from "@/lib/hooks/use-anonymous-chat";
import { ChatAnonymousShell } from "./chat-anonymous-shell";
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
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true" />
    );
  }

  if (!isAuthenticated) {
    return <AnonymousChatExperience />;
  }

  return (
    <AuthenticatedChatExperience
      conversationId={conversationId}
      pathname={pathname}
      userEmail={user?.email}
      userDisplayName={user?.displayName ?? null}
    />
  );
}

function AnonymousChatExperience() {
  const chat = useAnonymousChat();

  return (
    <>
      <ChatAnonymousShell
        remainingMessages={chat.remainingMessages}
        totalMessages={ANONYMOUS_CHAT.MAX_MESSAGES}
      >
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
          testId="chat-anonymous-panel"
        />
      </ChatAnonymousShell>

      <LoginGateModal
        open={chat.showLoginGate}
        onClose={chat.dismissLoginGate}
        redirectTo="/chat"
        onAuthenticated={chat.resetAnonymousChat}
      />
    </>
  );
}

interface AuthenticatedChatExperienceProps {
  conversationId?: string | null;
  pathname: string;
  userEmail?: string | null;
  userDisplayName: string | null;
}

function AuthenticatedChatExperience({
  conversationId,
  pathname,
  userEmail,
  userDisplayName,
}: AuthenticatedChatExperienceProps) {
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
      userInitials={initialsFromUser(userEmail, userDisplayName)}
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
