import { describe, expect, it, vi } from "vitest";
import { withRetry } from "@/modules/ai/utils/retry";

describe("withRetry", () => {
  it("succeeds on first attempt", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50 })).resolves.toBe(
      "ok",
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable errors", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("rate limit 429")).mockResolvedValue("ok");

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        baseDelayMs: 1,
        maxDelayMs: 10,
        isRetryable: (e) => e instanceof Error && e.message.includes("429"),
      }),
    ).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
