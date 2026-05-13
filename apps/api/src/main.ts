import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { apiEnvConfig } from "./config/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  app.enableCors({
    origin: apiEnvConfig.corsOrigins,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api", { exclude: ["health"] });

  const { port, host } = apiEnvConfig;
  await app.listen(port, host);
  logger.log(`Auryn API running on http://${host}:${port}`);
}

bootstrap();
