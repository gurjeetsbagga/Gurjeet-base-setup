import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { IsSafeText } from "../../../common/validators";

/**
 * DTO for sending a message to the AI assistant.
 *
 * Validates:
 * - message: required, safe text, max 10,000 chars
 * - conversationId: optional UUID (omit to start new conversation)
 * - context: optional metadata hint, max 500 chars
 */
export class SendMessageDto {
  @IsSafeText({ maxLength: 10000 })
  message!: string;

  @IsOptional()
  @IsUUID("4")
  conversationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;
}
