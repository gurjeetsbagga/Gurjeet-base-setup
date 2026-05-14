import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { StructuredLogger } from "./common/logger";
import type { AppConfig } from "./config";
import { validateSecretBoundaries } from "./config/validate-secrets";

async function bootstrap() {
  validateSecretBoundaries();

  const isDev = process.env.NODE_ENV !== "production";

  const logLevels = isDev
    ? (["log", "error", "warn", "debug", "verbose"] as const)
    : (["log", "error", "warn"] as const);

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const structuredLogger = new StructuredLogger([...logLevels]);
  app.useLogger(structuredLogger);

  const logger = new Logger("Bootstrap");
  const configService = app.get(ConfigService);
  const appCfg = configService.get<AppConfig>("app")!;

  app.enableCors({
    origin: appCfg.corsOrigins,
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
      validateCustomDecorators: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  app.setGlobalPrefix("api", { exclude: ["health", "health/ready"] });

  await app.listen(appCfg.port, appCfg.host);
  logger.log(`Auryn API running on http://${appCfg.host}:${appCfg.port} [${appCfg.nodeEnv}]`);
}

bootstrap();
