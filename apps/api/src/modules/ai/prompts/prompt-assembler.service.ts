import { Injectable, Logger } from "@nestjs/common";
import type { SystemPromptContext } from "../../conversations/interfaces";
import { buildSystemPrompt } from "./system-prompts";
import { MASTER_INSTRUCTIONS_PROMPT } from "./master-instructions.prompt";
import { COMPANY_GUARDRAILS_PROMPT } from "./company-guardrails.prompt";
import { PROTOCOL_RULES_PROMPT } from "./protocol-rules.prompt";
import { ESCALATION_RULES_PROMPT } from "./escalation-rules.prompt";
import { DISCLAIMER_PROMPT } from "./disclaimer.prompt";
import {
  InstructionSnapshotService,
  type InstructionSnapshot,
} from "./instruction-snapshot.service";

/**
 * Composes the full system prompt from layered, validated sources:
 *   1. Company guardrails
 *   2. Protocol / product rules
 *   3. Base persona + user context
 *   4. Active admin instructions (database-driven, versioned)
 *   5. Escalation rules + disclaimer tone
 */
@Injectable()
export class PromptAssemblerService {
  private readonly logger = new Logger(PromptAssemblerService.name);

  constructor(private readonly instructionSnapshot: InstructionSnapshotService) {}

  async assemble(context: SystemPromptContext, snapshot?: InstructionSnapshot): Promise<string> {
    const resolved = snapshot ?? (await this.instructionSnapshot.resolveActiveSnapshot());
    return this.assembleWithSnapshot(context, resolved);
  }

  async assembleWithSnapshot(
    context: SystemPromptContext,
    snapshot: InstructionSnapshot,
  ): Promise<string> {
    const parts: string[] = [
      MASTER_INSTRUCTIONS_PROMPT,
      COMPANY_GUARDRAILS_PROMPT,
      PROTOCOL_RULES_PROMPT,
      buildSystemPrompt(context),
    ];

    const adminBlock = await this.instructionSnapshot.assembleAdminBlock(snapshot);
    if (adminBlock) parts.push(adminBlock);

    parts.push(ESCALATION_RULES_PROMPT, DISCLAIMER_PROMPT);

    const assembled = parts.join("\n\n");

    if (assembled.length > 32000) {
      this.logger.warn(`System prompt truncated: ${assembled.length} chars`);
      return assembled.slice(0, 32000);
    }

    return assembled;
  }
}
