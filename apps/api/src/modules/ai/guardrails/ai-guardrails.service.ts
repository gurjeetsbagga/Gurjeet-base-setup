import { Injectable, Logger } from "@nestjs/common";
import { AiAuditLogger } from "../../../common/logger";
import type { ProviderMessage } from "../providers";
import { EMERGENCY_ESCALATION_MESSAGE, PHYSICIAN_ESCALATION_MESSAGE } from "./escalation-messages";

/**
 * Pre- and post-completion guardrails for AI interactions.
 *
 *   AiService → [pre-guardrails] → Provider → [post-guardrails] → response
 */
@Injectable()
export class AiGuardrailsService {
  private readonly logger = new Logger(AiGuardrailsService.name);

  constructor(private readonly aiAudit: AiAuditLogger) {}

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
      this.aiAudit.logSafetyEvent({
        requestId: context.requestId,
        userId: context.userId,
        code: "PROMPT_INJECTION",
        message: "Prompt injection detected",
      });
      return {
        allowed: false,
        reason: "Your message contains patterns that cannot be processed. Please rephrase.",
        code: "PROMPT_INJECTION",
      };
    }

    if (containsEmergencySignals(content)) {
      return {
        allowed: true,
        injectSystemNote: EMERGENCY_ESCALATION_MESSAGE,
        warning: { code: "MEDICAL_EMERGENCY", message: "Emergency signals detected in user input" },
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

    if (requestsDiagnosis(content) || requestsPrescription(content)) {
      return {
        allowed: true,
        injectSystemNote: PHYSICIAN_ESCALATION_MESSAGE,
        warning: { code: "CLINICAL_REQUEST", message: "User requested clinical authority" },
      };
    }

    return { allowed: true };
  }

  postValidate(
    content: string,
    context: { userId: string; requestId: string },
  ): PostValidationResult {
    if (!content || content.trim().length === 0) {
      this.aiAudit.logValidationFailure({
        requestId: context.requestId,
        userId: context.userId,
        reason: "empty_response",
        stage: "post",
      });
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

    if (containsBlockedTreatmentAdvice(content)) {
      this.logger.warn(`[${context.requestId}] Blocked treatment advice in AI output`);
      return {
        safe: true,
        sanitized: replaceWithPhysicianReferral(content),
        flag: { code: "TREATMENT_BLOCKED", message: "Treatment advice sanitized" },
      };
    }

    if (containsMedicalDiagnosis(content)) {
      this.aiAudit.logSafetyEvent({
        requestId: context.requestId,
        userId: context.userId,
        code: "MEDICAL_DIAGNOSIS",
      });
      return {
        safe: true,
        sanitized: appendWellnessDisclaimer(content),
        flag: {
          code: "MEDICAL_CONTENT",
          message: "Response contained medical language — disclaimer appended.",
        },
      };
    }

    if (containsMedicationOverride(content)) {
      return {
        safe: true,
        sanitized: appendWellnessDisclaimer(
          content +
            "\n\nPlease speak with your healthcare provider before making any changes to medications.",
        ),
        flag: { code: "MEDICATION_SAFETY", message: "Medication override language flagged" },
      };
    }

    return { safe: true };
  }
}

export type PreValidationResult =
  | {
      allowed: true;
      warning?: { code: string; message: string };
      injectSystemNote?: string;
    }
  | { allowed: false; reason: string; code: string };

export type PostValidationResult =
  | { safe: true; sanitized?: string; flag?: { code: string; message: string } }
  | { safe: false; reason: string; code: string };

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
    "jailbreak",
    "dan mode",
  ];
  return patterns.some((p) => lower.includes(p));
}

function containsEmergencySignals(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "can't breathe",
    "cannot breathe",
    "heart attack",
    "having a stroke",
    "severe bleeding",
    "overdose",
    "took too many pills",
    "want to kill myself",
    "going to kill myself",
    "suicide plan",
  ].some((p) => lower.includes(p));
}

function containsUrgentMedicalRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "chest pain",
    "suicidal",
    "want to die",
    "kill myself",
    "anaphylaxis",
    "unconscious",
  ].some((p) => lower.includes(p));
}

function requestsDiagnosis(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "do i have",
    "is this cancer",
    "diagnose me",
    "what disease",
    "what condition do i have",
  ].some((p) => lower.includes(p));
}

function requestsPrescription(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "prescribe me",
    "what medication should i take",
    "what dose should i take",
    "can you prescribe",
  ].some((p) => lower.includes(p));
}

function containsMedicalDiagnosis(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "you have been diagnosed with",
    "your diagnosis is",
    "i diagnose you with",
    "you are suffering from",
    "you definitely have",
  ].some((p) => lower.includes(p));
}

function containsBlockedTreatmentAdvice(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "you should take",
    "start taking",
    "stop taking your medication",
    "increase your dose",
    "decrease your dose",
  ].some((p) => lower.includes(p));
}

function containsMedicationOverride(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "stop your prescription",
    "ignore your doctor",
    "don't need your medication",
    "replace your medication with",
  ].some((p) => lower.includes(p));
}

function appendWellnessDisclaimer(content: string): string {
  return (
    content +
    "\n\n*This is wellness guidance, not medical advice. Please consult your healthcare provider for personalized medical decisions.*"
  );
}

function replaceWithPhysicianReferral(_content: string): string {
  return (
    "I want to support you thoughtfully, but I can't recommend specific treatments or medication changes. " +
    "Your healthcare provider is the right person to guide those decisions.\n\n" +
    "I'm here to help with wellness reflection, recovery support, and gentle next steps that don't replace clinical care."
  );
}
