import { describe, expect, it } from "vitest";
import { AiResponseValidatorService } from "@/modules/ai/validation/ai-response-validator.service";

describe("AiResponseValidatorService", () => {
  const validator = new AiResponseValidatorService();

  it("validates orchestrated JSON", () => {
    const result = validator.validateOrchestratedJson(
      JSON.stringify({
        content: "Take a gentle walk when you feel ready.",
        escalation: { type: "none" },
      }),
      "req-1",
    );
    expect(result.valid).toBe(true);
  });

  it("rejects unsafe action proposals", () => {
    const result = validator.validateProposedActions([
      {
        actionType: "log_symptom",
        title: "Log how you feel",
        description: "Track your energy today",
        priority: "low",
      },
    ]);
    expect(result.valid).toBe(true);
  });

  it("rejects malformed action proposals", () => {
    const result = validator.validateProposedActions([{ actionType: "invalid" }]);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toHaveLength(0);
    }
  });
});
