import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiStreamRequest, setAccessTokenGetter } from "@/lib/api/client";
import { sendMessageStream } from "@/lib/api/conversations";

describe("conversations API client", () => {
  beforeEach(() => {
    setAccessTokenGetter(() => "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: null,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests SSE stream with auth and stream flag", async () => {
    await sendMessageStream("conv-1", "Hello");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/conversations/conv-1/messages"),
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
      }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Accept")).toBe("text/event-stream");
    expect(headers.get("Authorization")).toBe("Bearer test-token");

    const body = JSON.parse(init.body as string) as { stream: boolean; content: string };
    expect(body.stream).toBe(true);
    expect(body.content).toBe("Hello");
  });

  it("apiStreamRequest throws on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    } as Response);

    await expect(apiStreamRequest("/conversations/x/messages", { method: "POST" })).rejects.toThrow(
      /unavailable/i,
    );
  });
});
