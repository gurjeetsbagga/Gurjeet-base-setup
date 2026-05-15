#!/usr/bin/env node
/**
 * Pre-flight checks before `pnpm dev`.
 * Usage: node scripts/dev-preflight.mjs [--strict]
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runDevPreflight, summarizeChecks } from "./lib/dev-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const strict = process.argv.includes("--strict");

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function icon(level) {
  if (level === "ok") return `${COLORS.green}✓${COLORS.reset}`;
  if (level === "warn") return `${COLORS.yellow}!${COLORS.reset}`;
  if (level === "error") return `${COLORS.red}✗${COLORS.reset}`;
  return `${COLORS.cyan}i${COLORS.reset}`;
}

console.log(`\n${COLORS.bold}Auryn — dev preflight${COLORS.reset}\n`);

const { checks, apiPort, webPort } = await runDevPreflight(ROOT, { strict });

for (const check of checks) {
  console.log(`  ${icon(check.level)} ${check.message}`);
  if (check.hint) {
    console.log(`    ${COLORS.dim}→ ${check.hint}${COLORS.reset}`);
  }
}

const { hasError, hasWarn } = summarizeChecks(checks);

console.log(
  `\n${COLORS.dim}Targets: API http://localhost:${apiPort} · Web http://localhost:${webPort}${COLORS.reset}\n`,
);

if (hasError) {
  console.log(`${COLORS.red}Preflight failed. Fix errors above before starting.${COLORS.reset}\n`);
  process.exit(1);
}

if (hasWarn) {
  console.log(
    `${COLORS.yellow}Preflight passed with warnings — services may still start.${COLORS.reset}\n`,
  );
} else {
  console.log(`${COLORS.green}Preflight OK.${COLORS.reset}\n`);
}

process.exit(0);
