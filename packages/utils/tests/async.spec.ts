import { describe, expect, it, vi } from "vitest";
import { sleep, retry } from "../src/async";

describe("sleep", () => {
  it("resolves after the given delay", async () => {
    vi.useFakeTimers();
    const p = sleep(100);
    vi.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe("retry", () => {
  it("returns on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await retry(fn, { attempts: 3, delayMs: 0 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure then succeeds", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("fail-1")).mockResolvedValue("ok");

    const result = await retry(fn, { attempts: 3, delayMs: 0 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));
    await expect(retry(fn, { attempts: 2, delayMs: 0 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
