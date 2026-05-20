"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ANONYMOUS_CHAT } from "@auryn/config/limits";
import { DashboardExploreGridShell } from "@/components/dashboard/dashboard-explore-grid-shell";
import { AuthModal, type AuthModalView } from "@/components/auth/auth-modal";
import { getDashboardPageMeta } from "@/lib/dashboard/page-meta";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  getReturningUserProfile,
  markWelcomeBackModalShown,
  shouldShowWelcomeBackModal,
} from "@/lib/auth/returning-user";
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>("hub");

  useEffect(() => {
    if (shouldShowWelcomeBackModal()) {
      setAuthModalView("welcome-back");
      setAuthModalOpen(true);
    }
  }, []);

  const openAuthModal = useCallback((view: AuthModalView) => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    if (authModalView === "welcome-back") {
      markWelcomeBackModalShown();
    }
    setAuthModalOpen(false);
  }, [authModalView]);

  const showGate = chat.showLoginGate;
  const modalOpen = authModalOpen || showGate;
  const modalView: AuthModalView = showGate ? "signup" : authModalView;

  return (
    <>
      <ChatAnonymousShell
        remainingMessages={chat.remainingMessages}
        totalMessages={ANONYMOUS_CHAT.MAX_MESSAGES}
        onSignInClick={() => openAuthModal(getReturningUserProfile() ? "welcome-back" : "hub")}
        onSignUpClick={() => openAuthModal("signup")}
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

      <AuthModal
        key={showGate ? "gate" : authModalView}
        open={modalOpen}
        onClose={() => {
          if (showGate) {
            chat.dismissLoginGate();
          }
          closeAuthModal();
        }}
        initialView={modalView}
        redirectTo="/"
        onAuthenticated={chat.resetAnonymousChat}
        trackWelcomeSession
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
