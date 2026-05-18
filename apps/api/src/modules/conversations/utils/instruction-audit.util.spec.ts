import { describe, expect, it } from "vitest";
import type { InstructionSnapshot } from "../../ai/prompts/instruction-snapshot.service";
import { instructionAuditFields, mergeMessageMetadata } from "./instruction-audit.util";

describe("instruction-audit.util", () => {
  const snapshot: InstructionSnapshot = {
    primaryVersionId: "ver-1",
    versions: [
      {
        instructionId: "instr-1",
        versionId: "ver-1",
        version: 1,
        slug: "safety",
        title: "Safety",
        category: "SAFETY_RULE",
        priority: 10,
      },
    ],
  };

  it("maps snapshot to persistence fields", () => {
    const fields = instructionAuditFields(snapshot);
    expect(fields.instructionVersionId).toBe("ver-1");
    expect(fields.metadata).toMatchObject({
      appliedInstructionVersions: [expect.objectContaining({ versionId: "ver-1", slug: "safety" })],
    });
  });

  it("merges AI metadata with instruction audit", () => {
    const merged = mergeMessageMetadata({ model: "gpt-4o" }, snapshot);
    expect(merged.model).toBe("gpt-4o");
    expect(merged.appliedInstructionVersions).toHaveLength(1);
  });
});
