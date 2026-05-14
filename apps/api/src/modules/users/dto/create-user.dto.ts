import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { UserRole } from "@prisma/client";
import { IsNotBlank } from "../../../common/validators";

export class CreateUserDto {
  /** Supabase Auth user ID */
  @IsString()
  authId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @IsNotBlank()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
