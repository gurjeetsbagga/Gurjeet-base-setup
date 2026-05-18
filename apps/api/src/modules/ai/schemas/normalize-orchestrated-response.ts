import type {
  AiOrchestratedResponse,
  NormalizedAiOrchestratedResponse,
} from "./orchestrated-response.schema";

/** Raw shape from model (may include legacy field names). */
export type RawOrchestratedResponse = AiOrchestratedResponse & {
  responseText?: string;
  suggestedActions?: AiOrchestratedResponse["proposedActions"];
  memorySignals?: string[];
  disclaimers?: string[];
};

/**
 * Normalize validated structured output to a single canonical shape.
 */
export function normalizeOrchestratedResponse(
  raw: RawOrchestratedResponse,
): NormalizedAiOrchestratedResponse {
  const content = raw.content ?? raw.responseText ?? "";
  const proposedActions = raw.proposedActions ?? raw.suggestedActions;
  const memoryHints = raw.memoryHints ?? raw.memorySignals;

  let disclaimer = raw.disclaimer;
  if (!disclaimer && raw.disclaimers?.length) {
    disclaimer = raw.disclaimers.join(" ");
  }

  let escalation = raw.escalation;
  if (raw.escalationRequired && (!escalation || escalation.type === "none")) {
    escalation = { type: "physician", message: escalation?.message };
  }

  return {
    content,
    tone: raw.tone,
    disclaimer,
    escalation,
    proposedActions,
    memoryHints,
  };
}
