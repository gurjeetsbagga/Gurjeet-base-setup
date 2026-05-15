#!/usr/bin/env node
/**
 * Generate API_JWT_SECRET in .env (Laravel `php artisan key:generate` equivalent).
 *
 * Usage:
 *   pnpm key:generate
 *   pnpm key:generate -- --force   # replace existing secret
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureApiJwtSecret } from "./lib/dev-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const force = process.argv.includes("--force");

const envPath = path.join(ROOT, ".env");
const result = ensureApiJwtSecret(ROOT, { force });

if (result.reason === "missing .env") {
  console.error("\n✗ No .env file found. Run: cp .env.example .env\n");
  process.exit(1);
}

if (result.reason === "skipped in production") {
  console.error("\n✗ Refusing to generate key when NODE_ENV=production.\n");
  process.exit(1);
}

if (!result.generated && result.reason === "already set" && !force) {
  console.log("\n✓ API_JWT_SECRET is already set in .env");
  console.log("  Use --force to replace it.\n");
  process.exit(0);
}

if (result.generated) {
  console.log("\n✓ Application key set successfully.");
  console.log(`  Updated: ${envPath}`);
  console.log("  Variable: API_JWT_SECRET\n");
  process.exit(0);
}

console.error("\n✗ Could not generate API_JWT_SECRET.\n");
process.exit(1);
