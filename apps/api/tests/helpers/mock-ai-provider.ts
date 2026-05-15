import { vi } from "vitest";
import type { AiProvider, ProviderRequest, ProviderResponse } from "@/modules/ai/providers";

export function createMockAiProvider(overrides?: Partial<AiProvider>): AiProvider & {
  complete: ReturnType<typeof vi.fn>;
  stream: ReturnType<typeof vi.fn>;
} {
  const complete = vi.fn(
    async (_request: ProviderRequest): Promise<ProviderResponse> => ({
      content: "Mock wellness response.",
      model: "mock/gpt-4o",
      usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
      finishReason: "stop",
    }),
  );

  async function* defaultStream(request: ProviderRequest) {
    const response = await complete(request);
    yield { delta: response.content, done: false };
    yield { delta: "", done: true, usage: response.usage, finishReason: "stop" };
  }

  const stream = vi.fn(defaultStream);

  return {
    name: "mock",
    complete,
    stream,
    ...overrides,
  };
}
