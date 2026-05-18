import { describe, expect, it, vi } from "vitest";
import { InstructionSnapshotService } from "@/modules/ai/prompts/instruction-snapshot.service";
import { PromptAssemblerService } from "@/modules/ai/prompts/prompt-assembler.service";

function createAssembler(snapshot: InstructionSnapshotService) {
  return new PromptAssemblerService(snapshot);
}

describe("PromptAssemblerService", () => {
  it("assembles layered system prompt with persona and guardrails", async () => {
    const snapshot = {
      resolveActiveSnapshot: vi.fn().mockResolvedValue({ primaryVersionId: null, versions: [] }),
      assembleAdminBlock: vi.fn().mockResolvedValue(null),
    } as unknown as InstructionSnapshotService;

    const assembler = createAssembler(snapshot);
    const prompt = await assembler.assemble({ userId: "u1", displayName: "Alex" });

    expect(prompt).toContain("Auryn");
    expect(prompt).toContain("Company guardrails");
    expect(prompt).toContain("Alex");
    expect(prompt).toContain("NOT a physician");
  });

  it("loads active admin instructions when snapshot has versions", async () => {
    const activeSnapshot = {
      primaryVersionId: "ver-1",
      versions: [
        {
          instructionId: "instr-1",
          versionId: "ver-1",
          version: 1,
          slug: "safety",
          title: "Safety",
          category: "SAFETY_RULE",
          priority: 1,
        },
      ],
    };

    const snapshot = {
      resolveActiveSnapshot: vi.fn().mockResolvedValue(activeSnapshot),
      assembleAdminBlock: vi
        .fn()
        .mockResolvedValue("## Admin instructions\n\n### Safety (v1)\nAlways defer to physicians."),
    } as unknown as InstructionSnapshotService;

    const assembler = createAssembler(snapshot);
    const prompt = await assembler.assemble({ userId: "u1" });

    expect(prompt).toContain("Admin instructions");
    expect(prompt).toContain("Safety");
  });
});
