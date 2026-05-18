import { describe, expect, it, vi } from "vitest";
import { AiOrchestrationService } from "@/modules/ai/ai-orchestration.service";
import type { AiService } from "@/modules/ai/ai.service";
import type { ActionValidationService } from "@/modules/action-validation/action-validation.service";

describe("AiOrchestrationService", () => {
  it("delegates completion to AiService", async () => {
    const ai = {
      complete: vi.fn().mockResolvedValue({
        content: "Hello",
        model: "stub/gpt-4o",
        tokenCount: { prompt: 1, completion: 2, total: 3 },
        metadata: { provider: "stub" },
        finishReason: "stop",
      }),
      structuredOutputEnabled: false,
      providerName: "stub",
      usesLiveOpenAi: false,
    } as unknown as AiService;

    const actionValidation = {
      proposeAction: vi.fn(),
    } as unknown as ActionValidationService;

    const service = new AiOrchestrationService(ai, actionValidation);
    const result = await service.complete({
      userId: "u1",
      conversationId: "c1",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(ai.complete).toHaveBeenCalled();
    expect(result.content).toBe("Hello");
  });

  it("finalizes proposed actions after message persist", async () => {
    const actionValidation = {
      proposeAction: vi.fn().mockResolvedValue({ id: "act-1", status: "validated" }),
    } as unknown as ActionValidationService;

    const ai = {
      complete: vi.fn(),
      structuredOutputEnabled: false,
    } as unknown as AiService;

    const service = new AiOrchestrationService(ai, actionValidation);

    const metadata = await service.finalizeProposedActions("u1", "c1", "m1", {
      orchestration: {
        structured: {
          content: "Take care",
          proposedActions: [
            {
              actionType: "journal_prompt",
              title: "Journal",
              description: "Write a short note",
              priority: "low",
            },
          ],
        },
      },
    });

    expect(actionValidation.proposeAction).toHaveBeenCalled();
    expect(metadata.proposedActionIds).toEqual(["act-1"]);
  });
});
