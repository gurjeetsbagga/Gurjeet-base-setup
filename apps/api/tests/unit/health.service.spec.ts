import { describe, expect, it, vi, beforeEach } from "vitest";
import { HealthService } from "@/modules/health/health.service";

function createMockDeps() {
  return {
    prisma: {
      isConnected: true,
      $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
    },
    supabase: {
      isEnabled: false,
      admin: null,
    },
    configService: {
      get: vi.fn((key: string) => {
        if (key === "app") return { nodeEnv: "test", isProduction: false };
        if (key === "database") return { url: "postgres://localhost/test" };
        return undefined;
      }),
    },
  };
}

describe("HealthService", () => {
  let service: HealthService;
  let deps: ReturnType<typeof createMockDeps>;

  beforeEach(() => {
    deps = createMockDeps();
    service = new HealthService(
      deps.prisma as unknown as ConstructorParameters<typeof HealthService>[0],
      deps.supabase as unknown as ConstructorParameters<typeof HealthService>[1],
      deps.configService as unknown as ConstructorParameters<typeof HealthService>[2],
    );
  });

  describe("liveness", () => {
    it("returns healthy status", () => {
      const report = service.liveness();
      expect(report.status).toBe("healthy");
      expect(report.service).toBe("auryn-api");
    });

    it("includes uptime and timestamp", () => {
      const report = service.liveness();
      expect(report.uptime).toBeGreaterThanOrEqual(0);
      expect(report.timestamp).toBeTruthy();
    });
  });

  describe("readiness", () => {
    it("returns healthy when all dependencies are up", async () => {
      const report = await service.readiness();
      expect(report.status).toBe("healthy");
      expect(report.checks).toBeDefined();
    });

    it("returns degraded when database is disconnected", async () => {
      deps.prisma.isConnected = false;
      const report = await service.readiness();
      expect(report.status).toBe("degraded");
      expect(report.checks?.find((c) => c.name === "database")?.status).toBe("degraded");
    });
  });
});
