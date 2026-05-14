import { Controller, Get, HttpCode, HttpStatus, Res, VERSION_NEUTRAL } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { HealthService } from "./health.service";

/**
 * Health monitoring endpoints — excluded from global API prefix and versioning.
 *
 * Marked @Public() so the global JwtAuthGuard skips these routes.
 * Marked @SkipThrottle() so health probes are never rate-limited.
 *
 * Endpoint design follows Kubernetes/Railway probe conventions:
 *   /health       — liveness (is the process running?)
 *   /health/ready — readiness (can it serve traffic?)
 *
 * Railway configuration (railway.toml):
 *   healthcheckPath = "/health"
 *   healthcheckTimeout = 10
 */
@SkipThrottle()
@Public()
@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Liveness probe — always returns 200 if the process is alive.
   *
   * Used by Railway health checks. Must respond within the timeout (10s).
   * Does NOT check dependencies — a live but unhealthy service should
   * still respond to liveness (so the orchestrator doesn't kill it prematurely).
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  liveness() {
    return this.healthService.liveness();
  }

  /**
   * Readiness probe — checks all critical dependencies.
   *
   * Returns 200 if ready, 503 if degraded or unhealthy.
   * Use for load balancer routing decisions — don't send traffic
   * to an instance that can't process requests.
   */
  @Get("ready")
  async readiness(@Res({ passthrough: true }) res: Response) {
    const report = await this.healthService.readiness();

    if (report.status === "unhealthy") {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    } else if (report.status === "degraded") {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return report;
  }
}
