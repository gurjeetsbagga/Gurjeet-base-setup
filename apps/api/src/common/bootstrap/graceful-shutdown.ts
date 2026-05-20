import type { INestApplication } from "@nestjs/common";
import type { Logger } from "nestjs-pino";
import { PrismaService } from "@/prisma/prisma.service";

const SHUTDOWN_TIMEOUT_MS = 30_000;

/**
 * Registers SIGTERM/SIGINT handlers for Railway rolling deploys.
 * Stops accepting new HTTP work, disconnects Prisma, then exits.
 */
export function registerGracefulShutdown(app: INestApplication, logger: Logger): void {
  app.enableShutdownHooks();

  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    logger.log(`[api] ${signal} received — initiating graceful shutdown`, "Shutdown");

    const forceExitTimer = setTimeout(() => {
      logger.error("[api] Shutdown timed out — forcing exit", "Shutdown");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimer.unref();

    try {
      const prisma = app.get(PrismaService);
      if (prisma.isConnected) {
        await prisma.$disconnect();
        logger.log("[api] Prisma disconnected", "Shutdown");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`[api] Prisma disconnect warning: ${message}`, "Shutdown");
    }

    try {
      await app.close();
      logger.log("[api] HTTP server closed", "Shutdown");
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[api] Shutdown failed: ${message}`, "Shutdown");
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  };

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
}
