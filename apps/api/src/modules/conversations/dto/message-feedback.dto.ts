import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class MessageFeedbackDto {
  @IsIn(["helpful", "not_helpful"])
  rating!: "helpful" | "not_helpful";

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
