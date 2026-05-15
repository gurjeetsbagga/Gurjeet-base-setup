import { Test, type TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { AiService } from "@/modules/ai/ai.service";
import { AiGuardrailsService } from "@/modules/ai/guardrails";
import { PromptAssemblerService } from "@/modules/ai/prompts/prompt-assembler.service";
import { AiResponseValidatorService } from "@/modules/ai/validation/ai-response-validator.service";
import { AI_PROVIDER } from "@/modules/ai/providers";
import { openaiConfig } from "@/config/configs/openai.config";
import { PrismaService } from "@/prisma/prisma.service";
import type { AiProvider } from "@/modules/ai/providers";
import { createMockAiProvider } from "./mock-ai-provider";

export interface AiTestModuleOptions {
  provider?: AiProvider;
  adminInstructions?: Array<{ title: string; content: string; priority: number }>;
}

export async function createAiTestModule(
  options: AiTestModuleOptions = {},
): Promise<TestingModule> {
  const provider = options.provider ?? createMockAiProvider();

  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [openaiConfig],
      }),
    ],
    providers: [
      AiService,
      AiGuardrailsService,
      PromptAssemblerService,
      AiResponseValidatorService,
      { provide: AI_PROVIDER, useValue: provider },
      {
        provide: PrismaService,
        useValue: {
          isConnected: Boolean(options.adminInstructions),
          adminInstruction: {
            findMany: async () => options.adminInstructions ?? [],
          },
        },
      },
    ],
  }).compile();
}
