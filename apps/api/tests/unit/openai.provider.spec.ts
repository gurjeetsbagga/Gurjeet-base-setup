import { beforeEach, describe, expect, it, vi } from "vitest";
import { GatewayTimeoutException } from "@nestjs/common";
import { OpenAiProvider } from "@/modules/ai/providers/openai.provider";

const createMock = vi.fn();

vi.mock("openai", () => {
  class MockOpenAI {
    chat = {
      completions: {
        create: createMock,
      },
    };
    constructor(_options: unknown) {}
  }
  return { default: MockOpenAI };
});

describe("OpenAiProvider", () => {
  const config = {
    apiKey: "sk-test-key",
    orgId: undefined,
    model: "gpt-4o",
    embeddingModel: "text-embedding-3-small",
    maxTokens: 100,
    temperature: 0.7,
    enabled: true,
    timeoutMs: 50_000,
    streamTimeoutMs: 100_000,
    maxRetries: 2,
    retryBaseDelayMs: 1,
  };

  beforeEach(() => {
    createMock.mockReset();
  });

  it("normalizes completion response", async () => {
    createMock.mockResolvedValue({
      model: "gpt-4o-2024",
      choices: [{ message: { content: "Rest and hydrate." }, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });

    const provider = new OpenAiProvider(config as never);
    provider.onModuleInit();

    const result = await provider.complete({
      messages: [{ role: "user", content: "Hi" }],
      model: "gpt-4o",
      maxTokens: 50,
      temperature: 0.5,
      requestId: "req-1",
    });

    expect(result.content).toBe("Rest and hydrate.");
    expect(result.usage.totalTokens).toBe(15);
    expect(result.finishReason).toBe("stop");
  });

  it("maps abort to gateway timeout", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    createMock.mockRejectedValue(abortError);

    const provider = new OpenAiProvider(config as never);
    provider.onModuleInit();

    await expect(
      provider.complete({
        messages: [{ role: "user", content: "Hi" }],
        model: "gpt-4o",
        maxTokens: 50,
        temperature: 0.5,
        requestId: "req-2",
      }),
    ).rejects.toBeInstanceOf(GatewayTimeoutException);
  });

  it("retries on rate limit errors", async () => {
    createMock.mockRejectedValueOnce(new Error("rate limit 429")).mockResolvedValue({
      model: "gpt-4o",
      choices: [{ message: { content: "OK" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    });

    const provider = new OpenAiProvider(config as never);
    provider.onModuleInit();

    const result = await provider.complete({
      messages: [{ role: "user", content: "Hi" }],
      model: "gpt-4o",
      maxTokens: 50,
      temperature: 0.5,
      requestId: "req-3",
    });

    expect(result.content).toBe("OK");
    expect(createMock).toHaveBeenCalledTimes(2);
  });
});
