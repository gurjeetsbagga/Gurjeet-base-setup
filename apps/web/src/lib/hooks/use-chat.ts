"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/components/chat/message-bubble";
import * as conversationsApi from "@/lib/api/conversations";
import { ApiClientError } from "@/lib/api/client";
import { useStreamingText } from "./use-streaming-text";
import { getAccessToken } from "@/lib/auth/session";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ASSISTANT",
  content:
    "Hello — I'm Auryn, your wellness companion. I'm here to listen, support your recovery journey, and help you explore what matters to you. How are you feeling today?",
};

const DEMO_REPLY =
  "Thank you for sharing that with me. I hear you, and I want to support you in a calm, thoughtful way. When you're ready, we can explore gentle next steps for your wellness — always alongside guidance from your care team when needed.";

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat(conversationId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversationId ?? null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const { displayText, isStreaming, streamFullText, reset: resetStream } = useStreamingText();

  useEffect(() => {
    setActiveConversationId(conversationId ?? null);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !getAccessToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await conversationsApi.getMessages(conversationId);
        if (cancelled || list.length === 0) return;
        setMessages(
          list.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })),
        );
      } catch {
        /* keep welcome */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, displayText, isSending]);

  const appendAssistantStreaming = useCallback(
    async (fullText: string) => {
      const id = generateId();
      setStreamingMessageId(id);
      setMessages((prev) => [...prev, { id, role: "ASSISTANT", content: "", isStreaming: true }]);
      await streamFullText(fullText);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: fullText, isStreaming: false } : m)),
      );
      setStreamingMessageId(null);
      resetStream();
    },
    [streamFullText, resetStream],
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { id: generateId(), role: "USER", content: text }]);
    setInput("");
    setIsSending(true);

    try {
      let convId = activeConversationId;
      if (getAccessToken()) {
        if (!convId) {
          const conv = await conversationsApi.createConversation();
          convId = conv.id;
          setActiveConversationId(convId);
        }
        const assistant = await conversationsApi.sendMessage(convId, text);
        await appendAssistantStreaming(assistant.content);
      } else {
        await new Promise((r) => setTimeout(r, 500));
        await appendAssistantStreaming(DEMO_REPLY);
      }
    } catch (err) {
      const fallback =
        err instanceof ApiClientError && err.status === 401
          ? "Please sign in to continue our conversation with full personalization."
          : DEMO_REPLY;
      await appendAssistantStreaming(fallback);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, activeConversationId, appendAssistantStreaming]);

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
    scrollRef,
    activeConversationId,
  };
}
