import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import type { ModerationStatus } from "../interfaces";

export class ReviewModerationDto {
  @IsIn(["reviewed", "dismissed", "escalated"])
  status!: Exclude<ModerationStatus, "pending">;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
