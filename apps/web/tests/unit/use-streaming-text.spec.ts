import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStreamingText } from "@/lib/hooks/use-streaming-text";

describe("useStreamingText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals text incrementally then completes", async () => {
    const { result } = renderHook(() => useStreamingText({ charsPerTick: 5, intervalMs: 10 }));

    await act(async () => {
      const done = result.current.streamFullText("Hello");
      await vi.advanceTimersByTimeAsync(500);
      await done;
    });

    expect(result.current.displayText).toBe("Hello");
    expect(result.current.isStreaming).toBe(false);
  });

  it("resets state", async () => {
    const { result } = renderHook(() => useStreamingText());

    await act(async () => {
      const done = result.current.streamFullText("Hi");
      await vi.advanceTimersByTimeAsync(500);
      await done;
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.displayText).toBe("");
    expect(result.current.isStreaming).toBe(false);
  });
});
