import { Injectable, Logger } from "@nestjs/common";
import type { ProviderMessage } from "../providers";

/**
 * Pre- and post-completion guardrails for AI interactions.
 *
 * Sits between the AiService orchestrator and the provider:
 *
 *   AiService → [pre-guardrails] → Provider → [post-guardrails] → response
 *
 * Responsibilities:
 *   - Block prompt injection attempts
 *   - Reject unsafe / out-of-scope requests
 *   - Sanitize AI output before it reaches the database
 *   - Flag content that needs human review
 *   - Enforce Auryn's medical safety boundaries
 */
@Injectable()
export class AiGuardrailsService {
  private readonly logger = new Logger(AiGuardrailsService.name);

  /**
   * Validate user input BEFORE sending to the AI provider.
   * Returns a rejection reason if the input should be blocked.
   */
  preValidate(
    messages: ProviderMessage[],
    context: { userId: string; requestId: string },
  ): PreValidationResult {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

    if (!lastUserMessage) {
      return { allowed: true };
    }

    const content = lastUserMessage.content;

    if (containsPromptInjection(content)) {
      this.logger.warn(
        `[${context.requestId}] Prompt injection detected from user ${context.userId}`,
      );
      return {
        allowed: false,
        reason: "Your message contains patterns that cannot be processed. Please rephrase.",
        code: "PROMPT_INJECTION",
      };
    }

    if (containsUrgentMedicalRequest(content)) {
      return {
        allowed: true,
        warning: {
          code: "MEDICAL_URGENCY",
          message:
            "If you are experiencing a medical emergency, please call emergency services immediately. " +
            "Auryn is a wellness companion and cannot provide emergency medical assistance.",
        },
      };
    }

    return { allowed: true };
  }

  /**
   * Validate AI output AFTER receiving from the provider,
   * BEFORE persisting to the database or returning to the client.
   *
   * This is the critical enforcement point — AI output is untrusted.
   */
  postValidate(
    content: string,
    context: { userId: string; requestId: string },
  ): PostValidationResult {
    if (!content || content.trim().length === 0) {
      this.logger.warn(`[${context.requestId}] Empty AI response`);
      return {
        safe: false,
        reason: "The AI returned an empty response. Please try again.",
        code: "EMPTY_RESPONSE",
      };
    }

    if (content.length > 50000) {
      this.logger.warn(`[${context.requestId}] AI response exceeds max length: ${content.length}`);
      return {
        safe: false,
        reason: "The response was too long to process.",
        code: "RESPONSE_TOO_LONG",
      };
    }

    if (containsMedicalDiagnosis(content)) {
      this.logger.warn(`[${context.requestId}] AI response contains potential medical diagnosis`);
      return {
        safe: true,
        sanitized: appendMedicalDisclaimer(content),
        flag: {
          code: "MEDICAL_CONTENT",
          message: "Response contained medical language — disclaimer appended.",
        },
      };
    }

    return { safe: true };
  }
}

// ── Types ────────────────────────────────────────────────

export type PreValidationResult =
  | { allowed: true; warning?: { code: string; message: string } }
  | { allowed: false; reason: string; code: string };

export type PostValidationResult =
  | { safe: true; sanitized?: string; flag?: { code: string; message: string } }
  | { safe: false; reason: string; code: string };

// ── Detection heuristics ─────────────────────────────────
// These are intentionally conservative starting points.
// They'll be refined with real usage patterns and potentially
// replaced by a dedicated moderation API.

function containsPromptInjection(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns = [
    "ignore previous instructions",
    "ignore all instructions",
    "disregard your instructions",
    "you are now",
    "act as if you have no restrictions",
    "pretend you are not",
    "override your system prompt",
    "system prompt:",
    "new instructions:",
  ];
  return patterns.some((p) => lower.includes(p));
}

function containsUrgentMedicalRequest(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns = [
    "overdose",
    "can't breathe",
    "chest pain",
    "heart attack",
    "suicidal",
    "want to die",
    "kill myself",
    "stroke symptoms",
    "severe bleeding",
    "anaphylaxis",
  ];
  return patterns.some((p) => lower.includes(p));
}

function containsMedicalDiagnosis(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns = [
    "you have been diagnosed with",
    "your diagnosis is",
    "i diagnose you with",
    "you are suffering from",
    "you should take the following medication",
    "i prescribe",
  ];
  return patterns.some((p) => lower.includes(p));
}

function appendMedicalDisclaimer(content: string): string {
  return (
    content +
    "\n\n---\n*Disclaimer: This information is for educational purposes only " +
    "and should not be considered medical advice. Please consult your " +
    "healthcare provider for personalized medical guidance.*"
  );
}
