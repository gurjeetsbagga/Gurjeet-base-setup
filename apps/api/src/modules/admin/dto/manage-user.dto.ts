import { IsBoolean, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
