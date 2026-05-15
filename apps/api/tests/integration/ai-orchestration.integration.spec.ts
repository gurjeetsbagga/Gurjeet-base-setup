import { beforeAll, describe, expect, it } from "vitest";
import { AiService } from "@/modules/ai/ai.service";
import { PromptAssemblerService } from "@/modules/ai/prompts/prompt-assembler.service";
import { createAiTestModule } from "../helpers/create-ai-test-module";

describe("AI orchestration (integration)", () => {
  let aiService: AiService;
  let promptAssembler: PromptAssemblerService;

  beforeAll(async () => {
    const module = await createAiTestModule({
      adminInstructions: [{ title: "Tone", content: "Stay calm and supportive.", priority: 1 }],
    });
    aiService = module.get(AiService);
    promptAssembler = module.get(PromptAssemblerService);
  });

  it("assembles admin instructions into system prompt", async () => {
    const prompt = await promptAssembler.assemble({ userId: "user-1", displayName: "Sam" });
    expect(prompt).toContain("Admin instructions");
    expect(prompt).toContain("Tone");
    expect(prompt).toContain("Sam");
  });

  it("exposes provider metadata on completion", async () => {
    const result = await aiService.complete({
      userId: "user-1",
      messages: [{ role: "user", content: "I need gentle recovery ideas" }],
    });

    expect(result.content.length).toBeGreaterThan(0);
    expect(result.metadata?.provider).toBe("mock");
    expect(result.metadata?.durationMs).toBeGreaterThanOrEqual(0);
  });
});
