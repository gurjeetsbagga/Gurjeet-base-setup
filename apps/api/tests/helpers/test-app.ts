import { Test, type TestingModule } from "@nestjs/testing";
import { type INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";

/**
 * Create a NestJS testing module from the given module metadata.
 * Reuse this helper across integration tests to avoid repeating boilerplate.
 */
export async function createTestApp(
  moduleMetadata: Parameters<typeof Test.createTestingModule>[0],
): Promise<{ app: INestApplication; module: TestingModule }> {
  const module = await Test.createTestingModule(moduleMetadata).compile();

  const app = module.createNestApplication();

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.setGlobalPrefix("api", { exclude: ["health", "health/ready"] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, module };
}
