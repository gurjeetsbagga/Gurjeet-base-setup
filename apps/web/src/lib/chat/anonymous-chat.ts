/**
 * Anonymous-chat client storage.
 *
 * Phase 1 (web only, no backend): we cap unauthenticated visitors to a small
 * number of preview messages and gate the rest behind sign-up. Everything is
 * stored in localStorage so it survives reloads but is trivially bypassed by
 * clearing site data — that is acceptable for a UX gate, NOT for security or
 * abuse prevention.
 *
 * Backend-enforced limits and a real `anonymous_sessions` table land in
 * Phase 2; the schema is sketched in
 * `docs/change-history/2026-05-19/*-anonymous-chat-prototype.md`.
 */

import { ANONYMOUS_CHAT } from "@auryn/config/limits";

const STORAGE_KEY = "auryn.anon-chat.v1";

export interface AnonymousChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface AnonymousChatState {
  messages: AnonymousChatMessage[];
  /** Count of USER messages only — assistant replies do not consume the quota. */
  userMessageCount: number;
}

const EMPTY_STATE: AnonymousChatState = {
  messages: [],
  userMessageCount: 0,
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readAnonymousChat(): AnonymousChatState {
  if (!isBrowser()) return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<AnonymousChatState>;
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      userMessageCount: typeof parsed.userMessageCount === "number" ? parsed.userMessageCount : 0,
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function writeAnonymousChat(state: AnonymousChatState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded or storage unavailable — degrade silently */
  }
}

export function clearAnonymousChat(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getRemainingMessages(state: AnonymousChatState): number {
  return Math.max(0, ANONYMOUS_CHAT.MAX_MESSAGES - state.userMessageCount);
}

export function hasReachedLimit(state: AnonymousChatState): boolean {
  return state.userMessageCount >= ANONYMOUS_CHAT.MAX_MESSAGES;
}
