#!/usr/bin/env node
/**
 * Pre-boot database readiness check (runs after prisma migrate deploy).
 * Retries with exponential backoff for Railway PostgreSQL cold starts.
 *
 * Policy: docs/engineering/railway-prisma-deployment.md
 */
"use strict";

const { PrismaClient, Prisma } = require("@prisma/client");
const { retryWithBackoff } = require("./lib/retry-backoff");

const LOG_PREFIX = "[api:db]";
const CONNECT_TIMEOUT_MS = Number(process.env.DB_READINESS_TIMEOUT_MS ?? 30_000);
const MAX_RETRIES = Number(process.env.DB_READINESS_MAX_RETRIES ?? 5);
const INITIAL_DELAY_MS = Number(process.env.DB_READINESS_INITIAL_DELAY_MS ?? 2_000);
const MAX_DELAY_MS = Number(process.env.DB_READINESS_MAX_DELAY_MS ?? 30_000);

/** Tables required for core API operations (must exist post-migrate). */
const REQUIRED_TABLES = [
  "_prisma_migrations",
  "users",
  "user_profiles",
  "conversations",
  "messages",
];

function log(message) {
  console.log(`${LOG_PREFIX} ${message}`);
}

function fail(message) {
  console.error(`${LOG_PREFIX} ERROR: ${message}`);
  process.exit(1);
}

function withTimeout(promise, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${CONNECT_TIMEOUT_MS}ms`));
    }, CONNECT_TIMEOUT_MS);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function runReadinessChecks() {
  const prisma = new PrismaClient();

  try {
    await withTimeout(prisma.$connect(), "Prisma connect");

    await withTimeout(prisma.$queryRaw`SELECT 1 AS ok`, "Connectivity query");

    // language=postgresql
    const tableRows = await withTimeout(
      prisma.$queryRaw`
        SELECT table_name::text AS name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (${Prisma.join(REQUIRED_TABLES)})
      `,
      "Table existence query",
    );

    const found = new Set(
      tableRows.map((row) => (typeof row.name === "string" ? row.name : String(row.name))),
    );
    const missing = REQUIRED_TABLES.filter((t) => !found.has(t));
    if (missing.length > 0) {
      throw new Error(`Missing required tables: ${missing.join(", ")}`);
    }

    // language=postgresql
    const migrationRows = await withTimeout(
      prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "_prisma_migrations"`,
      "Migration history query",
    );
    const migrationCount = Number(migrationRows[0]?.count ?? 0);
    if (migrationCount < 1) {
      throw new Error("_prisma_migrations is empty — migrations may not have been applied.");
    }

    await withTimeout(
      prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "users"`,
      "Users table query",
    );

    return migrationCount;
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL is not set.");
  }

  log("Running database readiness checks (with retry/backoff)...");

  let migrationCount = 0;

  try {
    migrationCount = await retryWithBackoff(
      async () => runReadinessChecks(),
      {
        maxRetries: MAX_RETRIES,
        initialDelayMs: INITIAL_DELAY_MS,
        maxDelayMs: MAX_DELAY_MS,
        logPrefix: LOG_PREFIX,
        label: "Database connection",
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Readiness checks failed after ${MAX_RETRIES} attempts: ${message}`);
  }

  log(`Migration history: ${migrationCount} recorded migration(s).`);
  log("Database ready.");
}

main();
