import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { AuditLogModule } from "../../modules/audit-logs/audit-logs.module";
import { loggingConfig, type LoggingConfig } from "../../config/configs/logging.config";
import { AiAuditLogger } from "./ai-audit.logger";
import { AuditPersistenceBridge } from "./audit-persistence.bridge";
import { CorrelationMiddleware } from "./correlation.middleware";
import { FileLogManager } from "./file-log.manager";
import { buildLoggerModuleParams } from "./logger.config";
import { LoggerService } from "./logger.service";
import { NoopTelemetryProvider } from "./observability/noop-telemetry.provider";
import { TELEMETRY_PORT } from "./observability/telemetry.port";
import { RequestLoggerInterceptor } from "./request-logger.interceptor";

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(loggingConfig),
    AuditLogModule,
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule.forFeature(loggingConfig)],
      inject: [ConfigService, FileLogManager],
      useFactory: (configService: ConfigService, fileLogManager: FileLogManager) => {
        const cfg = configService.get<LoggingConfig>("logging")!;
        return buildLoggerModuleParams(cfg, fileLogManager);
      },
    }),
  ],
  providers: [
    FileLogManager,
    LoggerService,
    AiAuditLogger,
    AuditPersistenceBridge,
    RequestLoggerInterceptor,
    CorrelationMiddleware,
    { provide: TELEMETRY_PORT, useClass: NoopTelemetryProvider },
  ],
  exports: [
    LoggerService,
    AiAuditLogger,
    AuditPersistenceBridge,
    RequestLoggerInterceptor,
    CorrelationMiddleware,
    FileLogManager,
    TELEMETRY_PORT,
    PinoLoggerModule,
  ],
})
export class AurynLoggerModule {}
