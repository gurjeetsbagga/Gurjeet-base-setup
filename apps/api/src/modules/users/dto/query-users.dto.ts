import { IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole, OnboardingStatus } from "@prisma/client";
import { PaginationDto } from "../../../common/dto";

export class QueryUsersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus;
}
