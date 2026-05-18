import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { LoggerService } from "../common/logger/logger.service";
import { loggingConfig } from "../config/configs/logging.config";
import { truncateForLog } from "../common/logger/redact.util";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private _isConnected = false;

  constructor(
    @Inject(loggingConfig.KEY)
    private readonly loggingCfg: ConfigType<typeof loggingConfig>,
    private readonly appLogger: LoggerService,
  ) {
    super({
      log: loggingCfg.logDbQueries
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ]
        : [
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ],
    });
    this.appLogger.setContext(PrismaService.name);
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async onModuleInit() {
    if (this.loggingCfg.logDbQueries) {
      (this as PrismaClient<Prisma.PrismaClientOptions, "query">).$on(
        "query",
        (event: Prisma.QueryEvent) => {
          this.appLogger.debug("Database query", {
            type: "db_query",
            durationMs: event.duration,
            query: truncateForLog(event.query, this.loggingCfg.isProduction),
          });
        },
      );
    }

    try {
      await this.$connect();
      this._isConnected = true;
      this.appLogger.info("Prisma connected");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.appLogger.warn(
        "Prisma failed to connect — database features unavailable until DATABASE_URL is valid",
        { error: message },
      );
    }
  }

  async onModuleDestroy() {
    if (this._isConnected) {
      await this.$disconnect();
      this.appLogger.info("Prisma disconnected");
    }
  }
}
