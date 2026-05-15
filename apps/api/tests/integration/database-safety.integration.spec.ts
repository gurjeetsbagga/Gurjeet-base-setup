import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AiResponseValidatorService } from "@/modules/ai/validation/ai-response-validator.service";

describe("Database safety boundaries", () => {
  const validator = new AiResponseValidatorService();

  it("AiService does not import Prisma directly", () => {
    const source = readFileSync(resolve(__dirname, "../../src/modules/ai/ai.service.ts"), "utf8");
    expect(source).not.toMatch(/PrismaService/);
    expect(source).not.toMatch(/prisma\./);
  });

  it("drops action types outside the allowed schema (AI cannot propose unknown actions)", () => {
    const result = validator.validateProposedActions([
      {
        actionType: "prescribe_medication",
        title: "Take aspirin",
        description: "Daily dose",
        priority: "high",
      },
    ]);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("accepts safe wellness action proposals", () => {
    const result = validator.validateProposedActions([
      {
        actionType: "log_symptom",
        title: "Log energy",
        description: "Track how you feel today",
        priority: "low",
      },
    ]);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toHaveLength(1);
    }
  });

  it("rejects malformed orchestrated JSON", () => {
    const result = validator.validateOrchestratedJson("{ not json", "req-1");
    expect(result.valid).toBe(false);
  });
});
