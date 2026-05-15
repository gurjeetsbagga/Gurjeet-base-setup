import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";
import {
  loadEnvFile,
  runDevPreflight,
  summarizeChecks,
  isPortFree,
  generateApiJwtSecret,
  setEnvVariable,
  ensureApiJwtSecret,
} from "./lib/dev-env.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("dev-env", () => {
  it("loadEnvFile parses simple assignments", () => {
    const env = loadEnvFile(path.join(ROOT, ".env.example"));
    assert.equal(typeof env.NODE_ENV, "string");
    assert.equal(env.API_PORT, "4000");
  });

  it("runDevPreflight returns checks array", async () => {
    const { checks, apiPort, webPort } = await runDevPreflight(ROOT);
    assert.ok(Array.isArray(checks));
    assert.ok(checks.length > 0);
    assert.equal(typeof apiPort, "number");
    assert.equal(typeof webPort, "number");
  });

  it("summarizeChecks detects errors", () => {
    const summary = summarizeChecks([
      { level: "ok", message: "fine" },
      { level: "error", message: "bad" },
    ]);
    assert.equal(summary.hasError, true);
  });

  it("isPortFree returns boolean", async () => {
    const result = await isPortFree(39_987);
    assert.equal(typeof result, "boolean");
  });

  it("generateApiJwtSecret returns non-empty string", () => {
    const secret = generateApiJwtSecret();
    assert.ok(secret.length >= 32);
  });

  it("ensureApiJwtSecret writes API_JWT_SECRET to .env", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "auryn-key-"));
    const envPath = path.join(tmp, ".env");
    fs.writeFileSync(envPath, "NODE_ENV=development\nAPI_JWT_SECRET=\n");

    const result = ensureApiJwtSecret(tmp);
    assert.equal(result.generated, true);

    const env = loadEnvFile(envPath);
    assert.ok(env.API_JWT_SECRET?.length > 20);

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("setEnvVariable replaces existing key", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "auryn-env-"));
    const envPath = path.join(tmp, ".env");
    fs.writeFileSync(envPath, "API_JWT_SECRET=old\n");

    setEnvVariable(envPath, "API_JWT_SECRET", "new-secret");
    assert.equal(loadEnvFile(envPath).API_JWT_SECRET, "new-secret");

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
