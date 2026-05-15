import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChat } from "@/lib/hooks/use-chat";
import * as conversationsApi from "@/lib/api/conversations";
import {
  mockAuthenticated,
  mockUnauthenticated,
  restoreSessionMocks,
} from "../helpers/mock-session";

vi.mock("@/lib/api/conversations");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

describe("useChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticated();
  });

  afterEach(() => {
    restoreSessionMocks();
    vi.useRealTimers();
  });

  it("starts with welcome message in demo mode", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages[0]?.role).toBe("ASSISTANT");
    expect(result.current.messages[0]?.content).toMatch(/wellness companion/i);
  });

  it("appends user message and demo reply when unauthenticated", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.setInput("I feel tired");
    });

    await act(async () => {
      void result.current.sendMessage();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    await waitFor(() => {
      expect(
        result.current.messages.some((m) => m.role === "USER" && m.content === "I feel tired"),
      ).toBe(true);
    });
  });

  it("calls API when authenticated", async () => {
    mockAuthenticated();
    vi.mocked(conversationsApi.createConversation).mockResolvedValue({
      id: "conv-1",
      title: null,
      status: "ACTIVE",
      lastMessageAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(conversationsApi.streamMessage).mockImplementation(async function* () {
      yield { type: "chunk" as const, delta: "Rest " };
      yield { type: "chunk" as const, delta: "when ready." };
      yield {
        type: "done" as const,
        message: {
          id: "msg-1",
          role: "ASSISTANT",
          status: "COMPLETED",
          content: "Rest when ready.",
          tokenCount: 10,
          metadata: {},
          feedbackRating: null,
          createdAt: new Date().toISOString(),
        },
      };
    });
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.setInput("Hello");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    await waitFor(() => {
      expect(conversationsApi.streamMessage).toHaveBeenCalled();
    });
  });
});
