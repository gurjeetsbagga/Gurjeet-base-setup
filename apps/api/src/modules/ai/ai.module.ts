import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";
import { AI_PROVIDER } from "./providers/ai-provider.interface";
import { OpenAiProvider } from "./providers/openai.provider";
import { StubAiProvider } from "./providers/stub.provider";
import { AiGuardrailsService } from "./guardrails/ai-guardrails.service";
import type { OpenAIConfig } from "../../config";

/**
 * AI module — provides the AI orchestration pipeline.
 *
 * Provider selection:
 *   - If OPENAI_API_KEY is set → OpenAiProvider (scaffold, not calling OpenAI yet)
 *   - Otherwise → StubAiProvider (deterministic dev responses)
 *
 * Exports AiService for use by ConversationsModule and other consumers.
 * No controller — client-facing AI interaction goes through ConversationsController.
 */
@Module({
  providers: [
    AiService,
    AiGuardrailsService,
    OpenAiProvider,
    StubAiProvider,
    {
      provide: AI_PROVIDER,
      useFactory: (configService: ConfigService, openai: OpenAiProvider, stub: StubAiProvider) => {
        const cfg = configService.get<OpenAIConfig>("openai");
        return cfg?.enabled ? openai : stub;
      },
      inject: [ConfigService, OpenAiProvider, StubAiProvider],
    },
  ],
  exports: [AiService, AiGuardrailsService],
})
export class AiModule {}
