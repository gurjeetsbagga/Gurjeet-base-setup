import { Injectable, Logger } from "@nestjs/common";
import {
  aiActionProposalSchema,
  aiOrchestratedResponseSchema,
  type AiActionProposal,
  type AiOrchestratedResponse,
} from "../schemas/orchestrated-response.schema";
import { validateAiOutput, parseAiJson } from "../schemas/validate-ai-output";

/**
 * Backend validation layer for AI outputs.
 *
 * CRITICAL: AI never writes to the database or executes actions directly.
 * This service validates structured proposals before they are stored as metadata.
 */
@Injectable()
export class AiResponseValidatorService {
  private readonly logger = new Logger(AiResponseValidatorService.name);

  /** Forbidden action types AI must not propose without human review */
  private readonly blockedActionTypes = new Set([
    "prescribe_medication",
    "diagnose",
    "emergency_triage",
  ]);

  validateOrchestratedJson(
    raw: string,
    requestId: string,
  ): { valid: true; data: AiOrchestratedResponse } | { valid: false; reason: string } {
    const parsed = parseAiJson(raw);
    if (parsed === null) {
      return { valid: false, reason: "Invalid JSON in structured response" };
    }

    const result = validateAiOutput(aiOrchestratedResponseSchema, parsed, {
      requestId,
      schemaName: "AiOrchestratedResponse",
    });

    if (!result.valid) {
      return { valid: false, reason: "Structured response failed schema validation" };
    }

    const actionCheck = this.validateProposedActions(result.data.proposedActions ?? []);
    if (!actionCheck.valid) {
      return { valid: false, reason: actionCheck.reason };
    }

    return { valid: true, data: result.data };
  }

  /**
   * Validate action proposals extracted from metadata — proposals only, never executed here.
   */
  validateProposedActions(
    actions: unknown[],
  ): { valid: true; data: AiActionProposal[] } | { valid: false; reason: string } {
    const validated: AiActionProposal[] = [];

    for (const raw of actions) {
      const result = aiActionProposalSchema.safeParse(raw);
      if (!result.success) {
        this.logger.warn(`Rejected malformed action proposal`);
        continue;
      }

      if (this.blockedActionTypes.has(result.data.actionType)) {
        return { valid: false, reason: `Blocked action type: ${result.data.actionType}` };
      }

      if (containsUnsafeActionContent(result.data)) {
        return { valid: false, reason: "Action proposal contains unsafe content" };
      }

      validated.push(result.data);
    }

    return { valid: true, data: validated };
  }
}

function containsUnsafeActionContent(action: AiActionProposal): boolean {
  const text = `${action.title} ${action.description}`.toLowerCase();
  const patterns = [
    "prescribe",
    "diagnose",
    "stop taking",
    "increase dose",
    "decrease dose",
    "replace your doctor",
  ];
  return patterns.some((p) => text.includes(p));
}
