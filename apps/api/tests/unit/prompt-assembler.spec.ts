import { describe, expect, it, vi } from "vitest";
import { PromptAssemblerService } from "@/modules/ai/prompts/prompt-assembler.service";

describe("PromptAssemblerService", () => {
  it("assembles layered system prompt with persona and guardrails", async () => {
    const prisma = {
      isConnected: false,
    } as never;

    const assembler = new PromptAssemblerService(prisma);
    const prompt = await assembler.assemble({ userId: "u1", displayName: "Alex" });

    expect(prompt).toContain("Auryn");
    expect(prompt).toContain("Company guardrails");
    expect(prompt).toContain("Alex");
    expect(prompt).toContain("NOT a doctor");
  });

  it("loads active admin instructions when DB connected", async () => {
    const prisma = {
      isConnected: true,
      adminInstruction: {
        findMany: vi.fn().mockResolvedValue([
          {
            title: "Safety",
            content: "Always defer to physicians.",
            priority: 1,
          },
        ]),
      },
    } as never;

    const assembler = new PromptAssemblerService(prisma);
    const prompt = await assembler.assemble({ userId: "u1" });

    expect(prompt).toContain("Admin instructions");
    expect(prompt).toContain("Safety");
  });
});
