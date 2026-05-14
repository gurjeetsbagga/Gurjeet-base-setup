import { z } from "zod";

/**
 * Zod schemas for validating AI-generated structured outputs.
 *
 * CRITICAL RULE: The backend validates ALL AI outputs before any
 * system/database action. AI is untrusted input — treat it like
 * user input from a security perspective.
 *
 * These schemas serve two purposes:
 *   1. Runtime validation of AI responses before persisting or acting
 *   2. Converted to JSON Schema for OpenAI's response_format (structured outputs)
 */

// ── Chat completion output ────────────────────────────────

export const aiTextResponseSchema = z.object({
  content: z.string().min(1).max(50000),
  citations: z
    .array(
      z.object({
        title: z.string().max(500),
        url: z.string().url().optional(),
        snippet: z.string().max(1000).optional(),
      }),
    )
    .optional(),
  suggestedFollowUps: z.array(z.string().max(200)).max(5).optional(),
});

export type AiTextResponse = z.infer<typeof aiTextResponseSchema>;

// ── Action card output (AI-suggested actions) ─────────────

export const aiActionCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  actionType: z.enum([
    "schedule_appointment",
    "log_symptom",
    "read_article",
    "start_exercise",
    "medication_reminder",
    "journal_prompt",
    "contact_provider",
  ]),
  priority: z.enum(["low", "medium", "high"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AiActionCard = z.infer<typeof aiActionCardSchema>;

export const aiActionCardsResponseSchema = z.object({
  cards: z.array(aiActionCardSchema).max(5),
});

export type AiActionCardsResponse = z.infer<typeof aiActionCardsResponseSchema>;

// ── Recovery insight output ───────────────────────────────

export const aiRecoveryInsightSchema = z.object({
  summary: z.string().min(1).max(2000),
  keyFindings: z.array(z.string().max(500)).max(10),
  recommendations: z.array(z.string().max(500)).max(5),
  riskLevel: z.enum(["none", "low", "moderate", "high"]).optional(),
  disclaimer: z.string().max(500).optional(),
});

export type AiRecoveryInsight = z.infer<typeof aiRecoveryInsightSchema>;

// ── Conversation title generation ─────────────────────────

export const aiConversationTitleSchema = z.object({
  title: z.string().min(1).max(100),
});

export type AiConversationTitle = z.infer<typeof aiConversationTitleSchema>;

// ── Topic extraction (for Private Brain indexing) ─────────

export const aiTopicExtractionSchema = z.object({
  topics: z.array(z.string().max(100)).max(10),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]).optional(),
  intentCategory: z
    .enum([
      "question",
      "guidance",
      "tracking",
      "emotional_support",
      "information",
      "action_request",
    ])
    .optional(),
});

export type AiTopicExtraction = z.infer<typeof aiTopicExtractionSchema>;
