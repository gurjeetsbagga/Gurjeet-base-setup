import { z } from "zod";

/**
 * Unified orchestrated response schema for structured OpenAI outputs.
 * Chat uses natural language in `content`; metadata fields are validated when present.
 *
 * AI may only PROPOSE actions — backend validates before any execution.
 */
export const aiActionProposalSchema = z.object({
  actionType: z.enum([
    "schedule_appointment",
    "log_symptom",
    "read_article",
    "start_exercise",
    "medication_reminder",
    "journal_prompt",
    "contact_provider",
    "update_recovery_plan",
    "store_memory",
    "update_preferences",
  ]),
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  priority: z.enum(["low", "medium", "high"]),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type AiActionProposal = z.infer<typeof aiActionProposalSchema>;

export const aiEscalationSchema = z.object({
  type: z.enum(["none", "physician", "emergency"]),
  message: z.string().max(1000).optional(),
});

const orchestratedFields = {
  content: z.string().min(1).max(50000).optional(),
  responseText: z.string().min(1).max(50000).optional(),
  tone: z.enum(["calm", "supportive", "encouraging", "reflective"]).optional(),
  disclaimer: z.string().max(500).optional(),
  disclaimers: z.array(z.string().max(500)).max(3).optional(),
  escalationRequired: z.boolean().optional(),
  escalation: aiEscalationSchema.optional(),
  proposedActions: z.array(aiActionProposalSchema).max(5).optional(),
  suggestedActions: z.array(aiActionProposalSchema).max(5).optional(),
  memoryHints: z.array(z.string().max(300)).max(5).optional(),
  memorySignals: z.array(z.string().max(300)).max(5).optional(),
};

export const aiOrchestratedResponseSchema = z
  .object(orchestratedFields)
  .refine((data) => Boolean(data.content?.trim() || data.responseText?.trim()), {
    message: "content or responseText is required",
  });

export type AiOrchestratedResponse = z.infer<typeof aiOrchestratedResponseSchema>;

/** Canonical shape after normalizeOrchestratedResponse — `content` is always set. */
export type NormalizedAiOrchestratedResponse = Omit<
  AiOrchestratedResponse,
  | "content"
  | "responseText"
  | "suggestedActions"
  | "memorySignals"
  | "disclaimers"
  | "escalationRequired"
> & {
  content: string;
};
