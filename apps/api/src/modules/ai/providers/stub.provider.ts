import { Injectable, Logger } from "@nestjs/common";
import type {
  AiProvider,
  ProviderRequest,
  ProviderResponse,
  ProviderStreamChunk,
} from "./ai-provider.interface";

/**
 * Stub AI provider for development and testing.
 *
 * Returns deterministic placeholder responses so the full
 * orchestration pipeline can be exercised without API keys.
 * Activated when OPENAI_API_KEY is not set.
 */
@Injectable()
export class StubAiProvider implements AiProvider {
  readonly name = "stub";
  private readonly logger = new Logger(StubAiProvider.name);

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    this.logger.debug(
      `[${request.requestId}] Stub completion: ${request.messages.length} messages`,
    );

    const lastUserMessage = [...request.messages].reverse().find((m) => m.role === "user");

    return {
      content: buildStubResponse(lastUserMessage?.content),
      model: `stub/${request.model}`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: "stop",
    };
  }

  async *stream(request: ProviderRequest): AsyncGenerator<ProviderStreamChunk> {
    this.logger.debug(`[${request.requestId}] Stub stream: ${request.messages.length} messages`);

    const response = await this.complete(request);
    const words = response.content.split(" ");

    for (let i = 0; i < words.length; i++) {
      const separator = i === 0 ? "" : " ";
      yield { delta: separator + words[i], done: false };
    }

    yield {
      delta: "",
      done: true,
      usage: response.usage,
      finishReason: response.finishReason,
    };
  }
}

function buildStubResponse(userMessage?: string): string {
  if (!userMessage) {
    return "Hello! I'm Auryn, your wellness companion. How can I help you today?";
  }

  const lower = userMessage.toLowerCase();

  if (lower.includes("recovery") || lower.includes("plan")) {
    return (
      "I'd love to help with your recovery journey. " +
      "This is a stub response — the AI provider will be connected soon. " +
      "Your recovery plan and personalized guidance will be available then."
    );
  }

  if (lower.includes("health") || lower.includes("wellness")) {
    return (
      "Great question about your health and wellness. " +
      "Once the AI provider is connected, I'll be able to provide " +
      "personalized insights based on your profile and recovery context."
    );
  }

  return (
    "Thank you for your message. I'm Auryn, running in development mode. " +
    "AI responses will be personalized once the provider is connected. " +
    "The orchestration pipeline is working correctly."
  );
}
