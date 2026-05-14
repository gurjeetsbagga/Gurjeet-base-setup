import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

/**
 * DTO for submitting feedback on an AI response.
 *
 * Validates:
 * - messageId: required, must be a valid UUID
 * - rating: required, must be "helpful" or "not_helpful"
 * - comment: optional free-text, max 2,000 chars
 */
export class FeedbackDto {
  @IsUUID("4")
  messageId!: string;

  @IsIn(["helpful", "not_helpful"])
  rating!: "helpful" | "not_helpful";

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
