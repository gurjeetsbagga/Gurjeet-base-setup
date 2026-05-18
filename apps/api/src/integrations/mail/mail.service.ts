import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { appConfig } from "../../config/configs/app.config";

export interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async sendPasswordReset({ to, resetUrl }: PasswordResetEmailParams): Promise<void> {
    const from = process.env.MAIL_FROM ?? "noreply@heyauryn.app";
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      if (this.app.isDev) {
        this.logger.warn(`RESEND_API_KEY not set — password reset link for ${to}: ${resetUrl}`);
        return;
      }
      this.logger.error("RESEND_API_KEY is required to send password reset emails");
      return;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your Hey Auryn password",
        html: `
          <p>We received a request to reset your password.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
        `.trim(),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Resend API failed (${response.status}): ${body}`);
    }
  }
}
