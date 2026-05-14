import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /** True once $connect() succeeds at least once. */
  private _isConnected = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this._isConnected = true;
      this.logger.log("Prisma connected");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Prisma failed to connect — the API will start but database features are unavailable. ` +
          `Ensure PostgreSQL is running and DATABASE_URL is set correctly. Error: ${message}`,
      );
    }
  }

  async onModuleDestroy() {
    if (this._isConnected) {
      await this.$disconnect();
      this.logger.log("Prisma disconnected");
    }
  }
}
