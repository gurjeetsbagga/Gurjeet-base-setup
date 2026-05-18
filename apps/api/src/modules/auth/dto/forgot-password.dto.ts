import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export const PASSWORD_RESET_REQUEST_MESSAGE =
  "If an account exists for that email, we sent a password reset link.";
