#!/usr/bin/env node
/**
 * Auryn local development orchestrator.
 *
 * Starts API + Web with preflight checks and API readiness wait.
 * Usage:
 *   pnpm dev
 *   pnpm dev -- --mobile    # also start Expo
 *   pnpm dev -- --no-wait   # skip wait-on (faster, may race API)
 *   pnpm dev -- --turbo     # raw turbo parallel (no wait-on)
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import concurrently from "concurrently";
import { runDevPreflight } from "./lib/dev-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const withMobile = args.includes("--mobile");
const noWait = args.includes("--no-wait");
const useTurbo = args.includes("--turbo");

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

function log(msg) {
  console.log(msg);
}

async function main() {
  log(
    `\n${COLORS.bold}╔══════════════════════════════════════════════════════════╗${COLORS.reset}`,
  );
  log(`${COLORS.bold}║  Auryn — local development                               ║${COLORS.reset}`);
  log(
    `${COLORS.bold}╚══════════════════════════════════════════════════════════╝${COLORS.reset}\n`,
  );

  log(`${COLORS.cyan}→ Running preflight checks…${COLORS.reset}\n`);

  const preflightCode = await new Promise((resolve) => {
    const preflight = spawn("node", ["scripts/dev-preflight.mjs"], {
      cwd: ROOT,
      stdio: "inherit",
      shell: false,
    });
    preflight.on("close", resolve);
  });

  if (preflightCode !== 0) {
    process.exit(preflightCode ?? 1);
  }

  const { apiPort, webPort } = await runDevPreflight(ROOT);
  const apiHealth = `http://127.0.0.1:${apiPort}/health`;

  if (useTurbo) {
    log(`${COLORS.cyan}→ Starting via Turborepo (parallel, no readiness wait)…${COLORS.reset}\n`);
    const filters = ["--filter=@auryn/web", "--filter=@auryn/api"];
    if (withMobile) filters.push("--filter=@auryn/mobile");
    await new Promise((resolve) => {
      const turbo = spawn("pnpm", ["exec", "turbo", "run", "dev", ...filters], {
        cwd: ROOT,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
      });
      turbo.on("close", (code) => resolve(code ?? 0));
    });
    return;
  }

  log(`${COLORS.dim}Services:${COLORS.reset}`);
  log(`  ${COLORS.green}Web${COLORS.reset}  → http://localhost:${webPort}`);
  log(`  ${COLORS.green}API${COLORS.reset}  → http://localhost:${apiPort}  (health: ${apiHealth})`);
  if (withMobile) {
    log(`  ${COLORS.green}Mobile${COLORS.reset} → Expo (see terminal output)`);
  }
  log("");

  const webCmd = noWait
    ? "pnpm --filter @auryn/web dev"
    : `pnpm exec wait-on ${apiHealth} -t 120000 -i 1000 -v && pnpm --filter @auryn/web dev`;

  const commands = [
    {
      name: "api",
      command: "pnpm --filter @auryn/api dev",
      prefixColor: "blue",
    },
    {
      name: "web",
      command: webCmd,
      prefixColor: "green",
    },
  ];

  if (withMobile) {
    commands.push({
      name: "mobile",
      command: "pnpm --filter @auryn/mobile start",
      prefixColor: "magenta",
    });
  }

  const { result } = concurrently(commands, {
    cwd: ROOT,
    prefix: "name",
    killOthers: ["failure"],
    restartTries: 0,
    raw: false,
  });

  try {
    await result;
  } catch (err) {
    const code = err?.exitCode ?? 1;
    log(`\n${COLORS.red}Dev orchestrator exited (code ${code}).${COLORS.reset}`);
    log(`${COLORS.dim}Tips:${COLORS.reset}`);
    log(`  • API only:  pnpm dev:api`);
    log(`  • Web only:  pnpm dev:web  (start API first)`);
    log(`  • Health:    pnpm dev:health`);
    log(`  • Verify:    pnpm verify\n`);
    process.exit(code);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
