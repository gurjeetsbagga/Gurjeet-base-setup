import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * DTO for approving or rejecting a proposed action.
 * Used by the user confirming an action card, or by an admin
 * reviewing a high-risk action.
 */
export class ResolveActionDto {
  @IsIn(["approved", "rejected"])
  resolution!: "approved" | "rejected";

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
