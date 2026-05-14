import type { ConversationStatus } from "@prisma/client";

/**
 * Application-layer conversation shape returned to clients.
 * Decoupled from Prisma's model to control exposure.
 */
export interface ConversationView {
  id: string;
  title: string | null;
  status: ConversationStatus;
  model: string | null;
  summary: string | null;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation-level metadata stored in the JSON column.
 * Topics, recovery context, and orchestration hints live here.
 */
export interface ConversationMetadata {
  /** Auto-generated topic tags for Private Brain indexing */
  topics?: string[];
  /** If this conversation is linked to a specific recovery plan */
  recoveryPlanId?: string;
  /** Orchestration source — which flow initiated this conversation */
  source?: "chat" | "action_card" | "recovery" | "onboarding" | "explore";
}
