"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/components/chat/message-bubble";
import * as conversationsApi from "@/lib/api/conversations";
import { ApiClientError } from "@/lib/api/client";
import { useStreamingText } from "./use-streaming-text";
import { hasUsableAccessToken } from "@/lib/auth/session";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ASSISTANT",
  content:
    "Hello — I'm Auryn, your wellness companion. I'm here to listen, support your recovery journey, and help you explore what matters to you. How are you feeling today?",
};

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type UseChatOptions = {
  /** Navigate to `/chat/:id` after the first message in a new conversation (default: true). */
  redirectOnCreate?: boolean;
};

export function useChat(conversationId?: string | null, options?: UseChatOptions) {
  const redirectOnCreate = options?.redirectOnCreate !== false;
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversationId ?? null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const { displayText, isStreaming, streamFullText, reset: resetStream } = useStreamingText();

  const showWelcomeOnly = messages.length === 1 && messages[0]?.id === "welcome" && !isSending;

  useEffect(() => {
    setActiveConversationId(conversationId ?? null);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !hasUsableAccessToken()) return;
    let cancelled = false;
    setIsLoadingHistory(true);
    setError(null);
    (async () => {
      try {
        const list = await conversationsApi.getMessages(conversationId);
        if (cancelled) return;
        if (list.length === 0) {
          setMessages([WELCOME]);
        } else {
          setMessages(
            list.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setMessages([WELCOME]);
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Could not load your conversation history.",
          );
        }
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo?.({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, displayText, isSending]);

  const appendAssistantError = useCallback(
    async (text: string) => {
      const id = generateId();
      setStreamingMessageId(id);
      setMessages((prev) => [...prev, { id, role: "ASSISTANT", content: "", isStreaming: true }]);
      await streamFullText(text);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: text, isStreaming: false } : m)),
      );
      setStreamingMessageId(null);
      resetStream();
    },
    [streamFullText, resetStream],
  );

  const streamFromApi = useCallback(
    async (convId: string, text: string) => {
      const id = generateId();
      setStreamingMessageId(id);
      setMessages((prev) => [...prev, { id, role: "ASSISTANT", content: "", isStreaming: true }]);

      let assembled = "";
      try {
        for await (const event of conversationsApi.streamMessage(convId, text)) {
          if (event.type === "chunk") {
            assembled += event.delta;
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, content: assembled, isStreaming: true } : m)),
            );
          } else if (event.type === "done") {
            assembled = event.message.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === id
                  ? { ...m, content: assembled, isStreaming: false, id: event.message.id }
                  : m,
              ),
            );
          } else if (event.type === "error") {
            throw new Error(event.error);
          }
        }
      } finally {
        setStreamingMessageId(null);
        resetStream();
      }
    },
    [resetStream],
  );

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || isSending) return;

      if (!hasUsableAccessToken()) {
        setError("Please sign in to continue our conversation.");
        return;
      }

      setError(null);
      setMessages((prev) => [...prev, { id: generateId(), role: "USER", content: text }]);
      if (!overrideText) setInput("");
      setIsSending(true);

      const startedWithoutConversation = !activeConversationId;
      try {
        let convId = activeConversationId;
        if (!convId) {
          const conv = await conversationsApi.createConversation();
          convId = conv.id;
          setActiveConversationId(convId);
        }
        await streamFromApi(convId, text);
        // Navigate only after the stream finishes — replacing the route mid-request
        // remounts this hook and aborts the in-flight SSE response.
        if (redirectOnCreate && startedWithoutConversation && convId) {
          router.replace(`/chat/${convId}`, { scroll: false });
        }
      } catch (err) {
        const message =
          err instanceof ApiClientError && err.status === 401
            ? "Your session expired. Please sign in again to continue."
            : err instanceof ApiClientError
              ? err.message
              : "Something went wrong saving your message. Please try again.";
        setError(message);
        await appendAssistantError(message);
      } finally {
        setIsSending(false);
      }
    },
    [
      input,
      isSending,
      activeConversationId,
      appendAssistantError,
      streamFromApi,
      router,
      redirectOnCreate,
    ],
  );

  const displayMessages = messages.map((m) =>
    m.id === streamingMessageId && isStreaming
      ? { ...m, content: displayText, isStreaming: true }
      : m,
  );

  const showTyping = isSending && !isStreaming && !streamingMessageId;

  return {
    messages: displayMessages,
    input,
    setInput,
    sendMessage,
    isSending,
    showTyping,
    isLoadingHistory,
    showWelcomeOnly,
    scrollRef,
    activeConversationId,
    error,
  };
}
