import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { SupabaseService } from "../../integrations/supabase";
import type { AppConfig } from "../../config";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface DependencyCheck {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  message?: string;
}

export interface HealthReport {
  status: HealthStatus;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  checks?: DependencyCheck[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Liveness check — is the process alive and responding?
   * Used by Railway's health check. Must be fast and never block.
   */
  liveness(): HealthReport {
    const appCfg = this.configService.get<AppConfig>("app")!;
    return {
      status: "healthy",
      service: "auryn-api",
      version: "1",
      environment: appCfg.nodeEnv,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check — can the service handle requests?
   * Checks critical dependencies. Returns 503 if not ready.
   */
  async readiness(): Promise<HealthReport> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkSupabase(),
      this.checkEnvironment(),
    ]);

    const overallStatus = resolveOverallStatus(checks);

    const report: HealthReport = {
      ...this.liveness(),
      status: overallStatus,
      checks,
    };

    if (overallStatus !== "healthy") {
      this.logger.warn({ type: "health_check", status: overallStatus, checks });
    }

    return report;
  }

  private async checkDatabase(): Promise<DependencyCheck> {
    if (!this.prisma.isConnected) {
      return {
        name: "database",
        status: "degraded",
        message: "Not connected (PostgreSQL may not be running)",
      };
    }

    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        name: "database",
        status: "healthy",
        responseTime: Date.now() - start,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Database health check failed: ${message}`);
      return {
        name: "database",
        status: "unhealthy",
        responseTime: Date.now() - start,
        message: "Connection failed",
      };
    }
  }

  private async checkSupabase(): Promise<DependencyCheck> {
    if (!this.supabase.isEnabled) {
      return {
        name: "supabase",
        status: "healthy",
        message: "Not configured (optional)",
      };
    }

    const start = Date.now();
    try {
      const client = this.supabase.admin;
      if (!client) {
        return {
          name: "supabase",
          status: "degraded",
          message: "Client not initialized",
        };
      }

      const { error } = await client.from("_health_check_noop").select("*").limit(0);
      if (error && error.code !== "42P01") {
        return {
          name: "supabase",
          status: "degraded",
          responseTime: Date.now() - start,
          message: "Connection issue",
        };
      }

      return {
        name: "supabase",
        status: "healthy",
        responseTime: Date.now() - start,
      };
    } catch {
      return {
        name: "supabase",
        status: "degraded",
        responseTime: Date.now() - start,
        message: "Connection failed",
      };
    }
  }

  private checkEnvironment(): DependencyCheck {
    const appCfg = this.configService.get<AppConfig>("app");
    const dbCfg = this.configService.get("database");

    const issues: string[] = [];

    if (!appCfg) issues.push("app config missing");
    if (!dbCfg?.url && appCfg?.isProduction) issues.push("DATABASE_URL not set");

    if (issues.length > 0) {
      return {
        name: "environment",
        status: "degraded",
        message: issues.join("; "),
      };
    }

    return {
      name: "environment",
      status: "healthy",
    };
  }
}

function resolveOverallStatus(checks: DependencyCheck[]): HealthStatus {
  if (checks.some((c) => c.status === "unhealthy")) return "unhealthy";
  if (checks.some((c) => c.status === "degraded")) return "degraded";
  return "healthy";
}
