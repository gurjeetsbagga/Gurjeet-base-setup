import { IsNotEmpty, IsString, MinLength, ValidateIf } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  password!: string;

  /** Local JWT adapter — raw token from email link query param */
  @ValidateIf((dto: ResetPasswordDto) => !dto.accessToken)
  @IsString()
  @IsNotEmpty()
  token?: string;

  /** Supabase adapter — access_token from recovery redirect hash */
  @ValidateIf((dto: ResetPasswordDto) => !dto.token)
  @IsString()
  @IsNotEmpty()
  accessToken?: string;
}
