"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ANONYMOUS_CHAT } from "@auryn/config/limits";
import type { ChatMessage } from "@/components/chat/message-bubble";
import {
  clearAnonymousChat,
  getRemainingMessages,
  hasReachedLimit,
  readAnonymousChat,
  writeAnonymousChat,
  type AnonymousChatMessage,
  type AnonymousChatState,
} from "@/lib/chat/anonymous-chat";
import { useStreamingText } from "./use-streaming-text";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ASSISTANT",
  content:
    "Hello — I'm Auryn, your wellness companion. Try a few questions to get a feel for how I think. Sign up when you'd like me to remember the details that matter to you.",
};

/**
 * Canned assistant reply used while running in anonymous-preview mode.
 *
 * Once the backend `anonymous_sessions` API lands (Phase 2) this hook will
 * stream real model output instead of synthesizing the response client-side.
 */
function buildMockReply(userMessage: string, remainingAfter: number): string {
  const trimmed = userMessage.trim();
  const intro =
    trimmed.length > 0
      ? `That's a thoughtful question. Here is a quick reflection on "${trimmed.slice(0, 80)}${
          trimmed.length > 80 ? "…" : ""
        }".`
      : "Here is a quick reflection on what you shared.";

  const guidance =
    "I can give a much more personalized answer once I know your recovery context, daily rhythm, and the goals that matter to you.";

  const nudge =
    remainingAfter <= 0
      ? "Sign up to continue our conversation and unlock personalized recovery guidance."
      : `You have ${remainingAfter} free message${remainingAfter === 1 ? "" : "s"} left in this preview.`;

  return `${intro} ${guidance} ${nudge}`;
}

function toChatMessage(m: AnonymousChatMessage): ChatMessage {
  return { id: m.id, role: m.role, content: m.content, createdAt: m.createdAt };
}

function generateId(): string {
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseAnonymousChatResult {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (overrideText?: string) => Promise<void>;
  isSending: boolean;
  showTyping: boolean;
  isLoadingHistory: boolean;
  showWelcomeOnly: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  error: string | null;
  /** User messages remaining in this preview. */
  remainingMessages: number;
  /** True once the user has used the full preview quota. */
  limitReached: boolean;
  /** When true, the parent should render the login gate modal. */
  showLoginGate: boolean;
  dismissLoginGate: () => void;
  resetAnonymousChat: () => void;
}

export function useAnonymousChat(): UseAnonymousChatResult {
  const [state, setState] = useState<AnonymousChatState>(() => readAnonymousChat());
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { displayText, isStreaming, streamFullText, reset: resetStream } = useStreamingText();

  useEffect(() => {
    writeAnonymousChat(state);
  }, [state]);

  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo?.({ top: el.scrollHeight, behavior: "smooth" });
  }, [state.messages, displayText, isSending]);

  const remainingMessages = getRemainingMessages(state);
  const limitReached = hasReachedLimit(state);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || isSending) return;

      if (hasReachedLimit(state)) {
        setShowLoginGate(true);
        return;
      }

      setError(null);
      const userMessage: AnonymousChatMessage = {
        id: generateId(),
        role: "USER",
        content: text,
        createdAt: new Date().toISOString(),
      };
      const nextUserCount = state.userMessageCount + 1;
      setState((prev) => ({
        messages: [...prev.messages, userMessage],
        userMessageCount: prev.userMessageCount + 1,
      }));
      if (!overrideText) setInput("");
      setIsSending(true);

      const remainingAfter = Math.max(0, ANONYMOUS_CHAT.MAX_MESSAGES - nextUserCount);
      const replyText = buildMockReply(text, remainingAfter);
      const assistantId = generateId();

      setStreamingMessageId(assistantId);
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: assistantId,
            role: "ASSISTANT",
            content: "",
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      try {
        await streamFullText(replyText);
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === assistantId ? { ...m, content: replyText } : m,
          ),
        }));
      } finally {
        setStreamingMessageId(null);
        resetStream();
        setIsSending(false);
      }

      if (remainingAfter <= 0) {
        setShowLoginGate(true);
      }
    },
    [input, isSending, state, streamFullText, resetStream],
  );

  const dismissLoginGate = useCallback(() => {
    setShowLoginGate(false);
  }, []);

  const resetAnonymousChat = useCallback(() => {
    clearAnonymousChat();
    setState({ messages: [], userMessageCount: 0 });
    setShowLoginGate(false);
  }, []);

  const showWelcomeOnly = state.messages.length === 0 && !isSending;

  const visibleMessages: ChatMessage[] = showWelcomeOnly
    ? [WELCOME]
    : state.messages
        .map(toChatMessage)
        .map((m) =>
          m.id === streamingMessageId && isStreaming
            ? { ...m, content: displayText, isStreaming: true }
            : m,
        );

  const showTyping = isSending && !isStreaming && !streamingMessageId;

  return {
    messages: visibleMessages,
    input,
    setInput,
    sendMessage,
    isSending,
    showTyping,
    isLoadingHistory: false,
    showWelcomeOnly,
    scrollRef,
    error,
    remainingMessages,
    limitReached,
    showLoginGate,
    dismissLoginGate,
    resetAnonymousChat,
  };
}
