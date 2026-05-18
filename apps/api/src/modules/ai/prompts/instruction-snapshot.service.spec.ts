import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstructionSnapshotService } from "./instruction-snapshot.service";

describe("InstructionSnapshotService", () => {
  const prisma = {
    isConnected: true,
    adminInstruction: {
      findMany: vi.fn(),
    },
    instructionVersion: {
      findMany: vi.fn(),
    },
  };

  let service: InstructionSnapshotService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InstructionSnapshotService(prisma as never);
  });

  it("returns empty snapshot when no active instructions", async () => {
    prisma.adminInstruction.findMany.mockResolvedValue([]);

    const snapshot = await service.resolveActiveSnapshot();

    expect(snapshot.primaryVersionId).toBeNull();
    expect(snapshot.versions).toEqual([]);
  });

  it("uses lowest priority instruction as primary version", async () => {
    prisma.adminInstruction.findMany.mockResolvedValue([
      {
        id: "instr-a",
        slug: "safety",
        title: "Safety",
        priority: 10,
        versions: [{ id: "ver-a", version: 1, category: "SAFETY_RULE", content: "Be safe" }],
      },
      {
        id: "instr-b",
        slug: "recovery",
        title: "Recovery",
        priority: 50,
        versions: [{ id: "ver-b", version: 2, category: "RECOVERY_GUIDANCE", content: "Recover" }],
      },
    ]);

    const snapshot = await service.resolveActiveSnapshot();

    expect(snapshot.primaryVersionId).toBe("ver-a");
    expect(snapshot.versions).toHaveLength(2);
    expect(snapshot.versions[0]?.versionId).toBe("ver-a");
  });
});
