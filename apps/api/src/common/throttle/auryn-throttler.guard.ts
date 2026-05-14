import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Custom throttler guard that extends the default ThrottlerGuard
 * with Auryn-specific behavior:
 *
 *   - Tracks by authenticated user ID when available (prevents
 *     IP-based evasion while preserving fair limits per user)
 *   - Falls back to IP for unauthenticated requests
 *   - Skips health endpoints entirely (they must never be throttled)
 */
@Injectable()
export class AurynThrottlerGuard extends ThrottlerGuard {
  /**
   * Use authenticated user ID as the tracker when available.
   * This prevents:
   *   - Shared IP abuse (NAT, corporate networks)
   *   - Per-user fairness regardless of IP changes
   */
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    if (user?.id) {
      return user.id;
    }

    return (req.ip as string) ?? "unknown";
  }

  /**
   * Skip throttling for health check endpoints — deployment
   * platforms (Railway, k8s) poll these frequently.
   */
  protected override async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ url?: string }>();
    const url = req.url ?? "";

    if (url.startsWith("/health")) {
      return true;
    }

    return false;
  }
}
