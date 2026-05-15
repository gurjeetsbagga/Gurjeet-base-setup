/**
 * Shared local development environment helpers.
 * Used by scripts/dev.mjs and node:test suites.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

export const SERVICE_PORTS = {
  api: 4000,
  web: 3000,
  admin: 3100,
};

/** @typedef {{ level: 'error' | 'warn' | 'info' | 'ok'; message: string; hint?: string }} DevCheck */

/**
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/**
 * @param {number} port
 * @returns {Promise<boolean>}
 */
export function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

/**
 * Generate a cryptographically secure secret for local JWT signing.
 * @returns {string}
 */
export function generateApiJwtSecret() {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Set or replace a key in a dotenv file (creates file if missing).
 * @param {string} filePath
 * @param {string} key
 * @param {string} value
 */
export function setEnvVariable(filePath, key, value) {
  const line = `${key}=${value}`;
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${line}\n`, "utf8");
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const next = pattern.test(content)
    ? content.replace(pattern, line)
    : `${content}${content.endsWith("\n") ? "" : "\n"}${line}\n`;

  fs.writeFileSync(filePath, next, "utf8");
}

/**
 * Ensure API_JWT_SECRET exists in `.env` (local dev only — like Laravel `key:generate`).
 * @param {string} rootDir
 * @param {{ force?: boolean }} [options]
 * @returns {{ generated: boolean; secret?: string; reason?: string }}
 */
export function ensureApiJwtSecret(rootDir, options = {}) {
  const { force = false } = options;
  const envPath = path.join(rootDir, ".env");
  const env = loadEnvFile(envPath);
  const nodeEnv = (process.env.NODE_ENV || env.NODE_ENV || "development").toLowerCase();

  if (nodeEnv === "production") {
    return { generated: false, reason: "skipped in production" };
  }

  if (!fs.existsSync(envPath)) {
    return { generated: false, reason: "missing .env" };
  }

  if (env.API_JWT_SECRET?.trim() && !force) {
    return { generated: false, reason: "already set" };
  }

  const secret = generateApiJwtSecret();
  setEnvVariable(envPath, "API_JWT_SECRET", secret);
  return { generated: true, secret };
}

/**
 * @param {string} rootDir
 * @param {{ strict?: boolean }} [options]
 * @returns {Promise<{ checks: DevCheck[]; env: Record<string, string>; apiPort: number; webPort: number }>}
 */
export async function runDevPreflight(rootDir, options = {}) {
  const { strict = false } = options;
  const checks = [];
  const envPath = path.join(rootDir, ".env");
  const examplePath = path.join(rootDir, ".env.example");
  const env = loadEnvFile(envPath);

  const apiPort = Number(env.API_PORT || SERVICE_PORTS.api);
  const webPort = Number(env.WEB_PORT || env.PORT || SERVICE_PORTS.web);

  if (!fs.existsSync(path.join(rootDir, "node_modules"))) {
    checks.push({
      level: "error",
      message: "Dependencies not installed",
      hint: "Run: pnpm install",
    });
  } else {
    checks.push({ level: "ok", message: "Workspace dependencies installed" });
  }

  if (!fs.existsSync(envPath)) {
    checks.push({
      level: strict ? "error" : "warn",
      message: "Missing .env file",
      hint: "Run: cp .env.example .env",
    });
  } else {
    checks.push({ level: "ok", message: ".env file present" });
  }

  if (!fs.existsSync(examplePath)) {
    checks.push({ level: "warn", message: ".env.example not found (unusual)" });
  }

  if (!env.API_JWT_SECRET?.trim()) {
    checks.push({
      level: strict ? "error" : "warn",
      message: "API_JWT_SECRET is empty",
      hint: "Run: pnpm key:generate",
    });
  } else {
    checks.push({ level: "ok", message: "API_JWT_SECRET configured" });
  }

  if (!env.DATABASE_URL?.trim()) {
    checks.push({
      level: "warn",
      message: "DATABASE_URL is not set",
      hint: "API boots in degraded mode. See SETUP.md → Database setup.",
    });
  } else {
    checks.push({ level: "ok", message: "DATABASE_URL configured" });
  }

  if (!env.OPENAI_API_KEY?.trim()) {
    checks.push({
      level: "info",
      message: "OPENAI_API_KEY not set — using stub AI provider (expected for local dev)",
    });
  }

  const publicApi = env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApi && !publicApi.includes(String(apiPort))) {
    checks.push({
      level: "warn",
      message: `NEXT_PUBLIC_API_URL (${publicApi}) may not match API_PORT (${apiPort})`,
      hint: "Unset NEXT_PUBLIC_API_URL in dev to auto-resolve, or align ports.",
    });
  }

  const apiFree = await isPortFree(apiPort);
  if (!apiFree) {
    checks.push({
      level: "warn",
      message: `Port ${apiPort} is already in use`,
      hint: "Another API instance may be running, or stop the process using this port.",
    });
  } else {
    checks.push({ level: "ok", message: `API port ${apiPort} is available` });
  }

  const webFree = await isPortFree(webPort);
  if (!webFree) {
    checks.push({
      level: "warn",
      message: `Port ${webPort} is already in use`,
      hint: "Another Next.js dev server may be running.",
    });
  } else {
    checks.push({ level: "ok", message: `Web port ${webPort} is available` });
  }

  return { checks, env, apiPort, webPort };
}

/**
 * @param {DevCheck[]} checks
 * @returns {{ hasError: boolean; hasWarn: boolean }}
 */
export function summarizeChecks(checks) {
  return {
    hasError: checks.some((c) => c.level === "error"),
    hasWarn: checks.some((c) => c.level === "warn"),
  };
}
