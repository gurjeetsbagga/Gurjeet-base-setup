#!/usr/bin/env node
/**
 * Poll local service health endpoints.
 * Usage: node scripts/dev-health.mjs [--api-port=4000] [--web-port=3000]
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFile, SERVICE_PORTS } from "./lib/dev-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const env = loadEnvFile(path.join(ROOT, ".env"));

const apiPort = Number(
  process.argv.find((a) => a.startsWith("--api-port="))?.split("=")[1] ||
    env.API_PORT ||
    SERVICE_PORTS.api,
);
const webPort = Number(
  process.argv.find((a) => a.startsWith("--web-port="))?.split("=")[1] ||
    env.WEB_PORT ||
    SERVICE_PORTS.web,
);

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

async function checkUrl(label, url, optional = false) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const ok = res.ok;
    const body = await res.text();
    let detail = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(body);
      if (json.status) detail += ` · status=${json.status}`;
      if (json.service) detail += ` · ${json.service}`;
    } catch {
      /* not json */
    }
    const color = ok ? COLORS.green : COLORS.yellow;
    console.log(`  ${color}${ok ? "✓" : "!"}${COLORS.reset} ${label}: ${detail}`);
    return ok;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (optional) {
      console.log(`  ${COLORS.yellow}!${COLORS.reset} ${label}: unavailable (${message})`);
      return true;
    }
    console.log(`  ${COLORS.red}✗${COLORS.reset} ${label}: ${message}`);
    return false;
  }
}

console.log(`\n${COLORS.bold}Auryn — service health${COLORS.reset}\n`);

const apiOk = await checkUrl("API /health", `http://127.0.0.1:${apiPort}/health`);
await checkUrl("API /health/ready", `http://127.0.0.1:${apiPort}/health/ready`, true);
const webOk = await checkUrl("Web", `http://127.0.0.1:${webPort}/`, true);

console.log("");
if (!apiOk) {
  console.log(`${COLORS.red}API is not reachable. Run: pnpm dev:api${COLORS.reset}\n`);
  process.exit(1);
}

if (!webOk) {
  console.log(
    `${COLORS.yellow}Web not reachable yet — it may still be compiling.${COLORS.reset}\n`,
  );
}

console.log(`${COLORS.green}API is healthy.${COLORS.reset}\n`);
process.exit(0);
