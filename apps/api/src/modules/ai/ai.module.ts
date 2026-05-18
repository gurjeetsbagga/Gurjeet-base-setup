import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ActionValidationModule } from "../action-validation/action-validation.module";
import { AiOrchestrationService } from "./ai-orchestration.service";
import { AiService } from "./ai.service";
import { AI_PROVIDER } from "./providers/ai-provider.interface";
import { OpenAiProvider } from "./providers/openai.provider";
import { StubAiProvider } from "./providers/stub.provider";
import { AiGuardrailsService } from "./guardrails/ai-guardrails.service";
import { InstructionSnapshotService } from "./prompts/instruction-snapshot.service";
import { PromptAssemblerService } from "./prompts/prompt-assembler.service";
import { AiResponseValidatorService } from "./validation/ai-response-validator.service";
import type { OpenAIConfig } from "../../config";

/**
 * AI module — secure orchestration boundary.
 *
 * Provider: OpenAI when OPENAI_API_KEY is set, otherwise StubAiProvider (dev/demo).
 * All client-facing AI traffic goes through ConversationsModule → AiOrchestrationService.
 */
@Module({
  imports: [ActionValidationModule],
  providers: [
    AiService,
    AiOrchestrationService,
    AiGuardrailsService,
    InstructionSnapshotService,
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
  exports: [
    AiService,
    AiOrchestrationService,
    AiGuardrailsService,
    InstructionSnapshotService,
    PromptAssemblerService,
    AiResponseValidatorService,
  ],
})
export class AiModule {}
