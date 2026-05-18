import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { RequestLoggerInterceptor } from "./common/logger";
import type { AppConfig, LoggingConfig } from "./config";
import { validateSecretBoundaries } from "./config/validate-secrets";

async function bootstrap() {
  validateSecretBoundaries();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const appCfg = configService.get<AppConfig>("app")!;
  const loggingCfg = configService.get<LoggingConfig>("logging")!;

  const bootstrapLogger = app.get(Logger);
  bootstrapLogger.log(
    `Logging enabled=${loggingCfg.enabled} level=${loggingCfg.level} pretty=${loggingCfg.pretty}`,
    "Bootstrap",
  );

  app.enableCors({
    origin: appCfg.corsOrigins,
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(app.get(RequestLoggerInterceptor));

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
  bootstrapLogger.log(
    `Auryn API running on http://${appCfg.host}:${appCfg.port} [${appCfg.nodeEnv}]`,
    "Bootstrap",
  );
}

bootstrap();
