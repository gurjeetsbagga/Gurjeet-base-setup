import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { IsNotBlank } from "../../../common/validators";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  @IsNotBlank()
  @MaxLength(100)
  displayName?: string;
}
