import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";
import { AI_PROVIDER } from "./providers/ai-provider.interface";
import { OpenAiProvider } from "./providers/openai.provider";
import { StubAiProvider } from "./providers/stub.provider";
import { AiGuardrailsService } from "./guardrails/ai-guardrails.service";
import { PromptAssemblerService } from "./prompts/prompt-assembler.service";
import { AiResponseValidatorService } from "./validation/ai-response-validator.service";
import type { OpenAIConfig } from "../../config";

/**
 * AI module — secure orchestration boundary.
 *
 * Provider: OpenAI when OPENAI_API_KEY is set, otherwise StubAiProvider (dev/demo).
 * All client-facing AI traffic goes through ConversationsModule → AiService.
 */
@Module({
  providers: [
    AiService,
    AiGuardrailsService,
    PromptAssemblerService,
    AiResponseValidatorService,
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
  exports: [AiService, AiGuardrailsService, PromptAssemblerService, AiResponseValidatorService],
})
export class AiModule {}
