import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { IsSafeText } from "../../../common/validators";
import type { ConversationMetadata } from "../interfaces";

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  /** First message to seed the conversation (optional — can also POST a message separately) */
  @IsOptional()
  @IsSafeText({ maxLength: 10000 })
  initialMessage?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsEnum(["chat", "action_card", "recovery", "onboarding", "explore"])
  source?: ConversationMetadata["source"];
}
