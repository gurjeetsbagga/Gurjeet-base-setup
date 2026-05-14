import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import { OnboardingStatus } from "@prisma/client";
import { IsNotBlank } from "../../../common/validators";
import type { UserPreferences } from "../interfaces";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotBlank()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus;

  @IsOptional()
  @IsObject()
  preferences?: UserPreferences;
}
