import type { SystemPromptContext } from "../../conversations/interfaces";

/**
 * System prompt templates for Auryn.
 *
 * These define the AI's persona, boundaries, and behavioral
 * constraints. They are assembled at request time with user
 * context injected.
 *
 * RULES:
 *   - Auryn is a wellness companion, NOT a medical professional
 *   - Never diagnoses, prescribes, or replaces professional care
 *   - Calm, intelligent, personalized, guided but not pushy
 *   - Always defers to PhysicianOS / providers for clinical decisions
 */

/**
 * User-specific context layered after master instructions and guardrails.
 */
export function buildSystemPrompt(context: SystemPromptContext): string {
  const parts: string[] = ["## Session context"];

  if (context.displayName) {
    parts.push(`The user's name is ${context.displayName}. Use it naturally but not excessively.`);
  }

  if (context.onboardingStatus === "NOT_STARTED") {
    parts.push(
      "This user has not completed onboarding. " +
        "Gently guide them through getting started and understanding what Auryn can help with.",
    );
  }

  if (context.memorySummary) {
    parts.push(
      `Context from previous conversations:\n${context.memorySummary}\n\n` +
        "Use this context to provide continuity, but don't reference it explicitly.",
    );
  }

  if (context.recoveryContext) {
    parts.push(
      `Current recovery plan context:\n${context.recoveryContext}\n\n` +
        "Reference this when relevant to provide personalized guidance.",
    );
  }

  return parts.join("\n\n");
}

/**
 * Minimal system prompt for lightweight tasks (title generation, topic extraction).
 */
export function buildUtilityPrompt(task: string): string {
  return `You are a helpful assistant performing a specific task. ${task}\n\nRespond ONLY with valid JSON matching the requested format. No explanations or markdown.`;
}
