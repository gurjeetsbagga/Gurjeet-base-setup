import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { SystemPromptContext } from "../../conversations/interfaces";
import { buildSystemPrompt } from "./system-prompts";
import { COMPANY_GUARDRAILS_PROMPT } from "./company-guardrails.prompt";
import { PROTOCOL_RULES_PROMPT } from "./protocol-rules.prompt";
import { ESCALATION_RULES_PROMPT } from "./escalation-rules.prompt";
import { DISCLAIMER_PROMPT } from "./disclaimer.prompt";

const MAX_INSTRUCTION_CHARS = 8000;
const MAX_SINGLE_INSTRUCTION = 4000;

/**
 * Composes the full system prompt from layered, validated sources:
 *   1. Company guardrails
 *   2. Protocol / product rules
 *   3. Base persona + user context
 *   4. Active admin instructions (database-driven)
 *   5. Escalation rules + disclaimer tone
 */
@Injectable()
export class PromptAssemblerService {
  private readonly logger = new Logger(PromptAssemblerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async assemble(context: SystemPromptContext): Promise<string> {
    const parts: string[] = [
      COMPANY_GUARDRAILS_PROMPT,
      PROTOCOL_RULES_PROMPT,
      buildSystemPrompt(context),
    ];

    const adminBlock = await this.loadAdminInstructions();
    if (adminBlock) parts.push(adminBlock);

    parts.push(ESCALATION_RULES_PROMPT, DISCLAIMER_PROMPT);

    const assembled = parts.join("\n\n");

    if (assembled.length > 32000) {
      this.logger.warn(`System prompt truncated: ${assembled.length} chars`);
      return assembled.slice(0, 32000);
    }

    return assembled;
  }

  private async loadAdminInstructions(): Promise<string | null> {
    if (!this.prisma.isConnected) return null;

    try {
      const instructions = await this.prisma.adminInstruction.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
        take: 20,
      });

      if (instructions.length === 0) return null;

      const blocks: string[] = ["## Admin instructions"];
      let total = 0;

      for (const instr of instructions) {
        const content = sanitizeInstructionContent(instr.content);
        if (!content) continue;

        const block = `### ${instr.title}\n${content}`;
        if (total + block.length > MAX_INSTRUCTION_CHARS) break;
        blocks.push(block);
        total += block.length;
      }

      return blocks.length > 1 ? blocks.join("\n\n") : null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to load admin instructions: ${message}`);
      return null;
    }
  }
}

function sanitizeInstructionContent(content: string): string {
  const trimmed = content.trim().slice(0, MAX_SINGLE_INSTRUCTION);
  const lower = trimmed.toLowerCase();
  const forbidden = [
    "ignore previous",
    "ignore all instructions",
    "you are now dan",
    "bypass safety",
  ];
  if (forbidden.some((p) => lower.includes(p))) {
    return "";
  }
  return trimmed;
}
