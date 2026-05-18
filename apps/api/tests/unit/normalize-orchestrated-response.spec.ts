import { describe, expect, it } from "vitest";
import { normalizeOrchestratedResponse } from "@/modules/ai/schemas/normalize-orchestrated-response";

describe("normalizeOrchestratedResponse", () => {
  it("maps responseText to content", () => {
    const result = normalizeOrchestratedResponse({
      responseText: "Hello",
    });
    expect(result.content).toBe("Hello");
  });

  it("maps suggestedActions and memorySignals", () => {
    const result = normalizeOrchestratedResponse({
      content: "Hi",
      suggestedActions: [
        {
          actionType: "journal_prompt",
          title: "Reflect",
          description: "Note how you feel",
          priority: "low",
        },
      ],
      memorySignals: ["prefers morning walks"],
    });
    expect(result.proposedActions).toHaveLength(1);
    expect(result.memoryHints).toEqual(["prefers morning walks"]);
  });

  it("sets physician escalation when escalationRequired", () => {
    const result = normalizeOrchestratedResponse({
      content: "Please see your doctor",
      escalationRequired: true,
    });
    expect(result.escalation?.type).toBe("physician");
  });
});
