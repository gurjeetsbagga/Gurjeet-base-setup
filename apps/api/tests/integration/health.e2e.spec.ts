import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { type INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { HealthModule } from "@/modules/health/health.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { PrismaService } from "@/prisma/prisma.service";
import { SupabaseModule, SupabaseService } from "@/integrations/supabase";
import { ConfigModule } from "@nestjs/config";

describe("Health endpoints (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              app: { nodeEnv: "test", isProduction: false },
              database: { url: null },
            }),
          ],
        }),
        PrismaModule,
        SupabaseModule,
        HealthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({ isConnected: false, $queryRaw: async () => [{}] })
      .overrideProvider(SupabaseService)
      .useValue({ isEnabled: false, admin: null })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix("api", { exclude: ["health", "health/ready"] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /health returns 200 with healthy status", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);

    expect(res.body).toMatchObject({
      status: "healthy",
      service: "auryn-api",
    });
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it("GET /health/ready returns dependency checks", async () => {
    const res = await request(app.getHttpServer()).get("/health/ready");

    expect(res.body.checks).toBeDefined();
    expect(Array.isArray(res.body.checks)).toBe(true);
    expect(res.body.checks.length).toBeGreaterThan(0);
  });
});
