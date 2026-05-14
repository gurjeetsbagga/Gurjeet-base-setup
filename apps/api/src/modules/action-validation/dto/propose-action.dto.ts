import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import type { ActionPriority, ActionType } from "../interfaces";

/**
 * DTO for proposing an action from an AI response.
 * Typically called internally by the ConversationsService when the AI
 * suggests an action card — not directly by end users.
 */
export class ProposeActionDto {
  @IsIn([
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
  ])
  type!: ActionType;

  @IsUUID()
  conversationId!: string;

  @IsUUID()
  messageId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  priority?: ActionPriority;
}
