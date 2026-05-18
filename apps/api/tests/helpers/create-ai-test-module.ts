import { Test, type TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { AiOrchestrationService } from "@/modules/ai/ai-orchestration.service";
import { AiService } from "@/modules/ai/ai.service";
import { ActionValidationService } from "@/modules/action-validation/action-validation.service";
import { AiGuardrailsService } from "@/modules/ai/guardrails";
import { AiAuditLogger } from "@/common/logger";
import { InstructionSnapshotService } from "@/modules/ai/prompts/instruction-snapshot.service";
import { PromptAssemblerService } from "@/modules/ai/prompts/prompt-assembler.service";
import { createMockAiAuditLogger } from "./mock-ai-audit";
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
      AiOrchestrationService,
      { provide: AiAuditLogger, useValue: createMockAiAuditLogger() },
      AiGuardrailsService,
      InstructionSnapshotService,
      PromptAssemblerService,
      AiResponseValidatorService,
      {
        provide: ActionValidationService,
        useValue: {
          proposeAction: async () => ({ id: "test-action", status: "validated" }),
        },
      },
      { provide: AI_PROVIDER, useValue: provider },
      {
        provide: PrismaService,
        useValue: {
          isConnected: Boolean(options.adminInstructions?.length),
          adminInstruction: {
            findMany: async () =>
              (options.adminInstructions ?? []).map((instr, index) => ({
                id: `instr-${index}`,
                slug: `slug-${index}`,
                title: instr.title,
                priority: instr.priority,
                versions: [
                  {
                    id: `ver-${index}`,
                    version: 1,
                    category: "SAFETY_RULE",
                    content: instr.content,
                  },
                ],
              })),
          },
          instructionVersion: {
            findMany: async ({ where }: { where: { id: { in: string[] } } }) =>
              where.id.in.map((id, index) => ({
                id,
                version: 1,
                category: "SAFETY_RULE",
                content: options.adminInstructions?.[index]?.content ?? "",
              })),
          },
        },
      },
    ],
  }).compile();
}
