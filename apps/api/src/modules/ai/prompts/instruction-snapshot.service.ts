import { Injectable, Logger } from "@nestjs/common";
import type { InstructionCategory } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

const MAX_INSTRUCTION_CHARS = 8000;
const MAX_SINGLE_INSTRUCTION = 4000;

/** One published admin instruction version included in a prompt turn. */
export interface AppliedInstructionVersion {
  instructionId: string;
  versionId: string;
  version: number;
  slug: string;
  title: string;
  category: InstructionCategory;
  priority: number;
}

/** Instruction set frozen for a single chat turn (Step 1 audit requirement). */
export interface InstructionSnapshot {
  /** Highest-precedence active instruction version (lowest priority number). */
  primaryVersionId: string | null;
  versions: AppliedInstructionVersion[];
}

@Injectable()
export class InstructionSnapshotService {
  private readonly logger = new Logger(InstructionSnapshotService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveActiveSnapshot(): Promise<InstructionSnapshot> {
    if (!this.prisma.isConnected) {
      return { primaryVersionId: null, versions: [] };
    }

    try {
      const instructions = await this.prisma.adminInstruction.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
        take: 20,
        include: {
          versions: {
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });

      const versions: AppliedInstructionVersion[] = [];

      for (const instr of instructions) {
        const latest = instr.versions[0];
        if (!latest) continue;

        versions.push({
          instructionId: instr.id,
          versionId: latest.id,
          version: latest.version,
          slug: instr.slug,
          title: instr.title,
          category: latest.category,
          priority: instr.priority,
        });
      }

      return {
        primaryVersionId: versions[0]?.versionId ?? null,
        versions,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to resolve instruction snapshot: ${message}`);
      return { primaryVersionId: null, versions: [] };
    }
  }

  /** Builds the admin-instructions section from frozen version rows. */
  async assembleAdminBlock(snapshot: InstructionSnapshot): Promise<string | null> {
    if (snapshot.versions.length === 0 || !this.prisma.isConnected) return null;

    try {
      const versionIds = snapshot.versions.map((v) => v.versionId);
      const versionRows = await this.prisma.instructionVersion.findMany({
        where: { id: { in: versionIds } },
      });
      const byId = new Map(versionRows.map((r) => [r.id, r]));

      const blocks: string[] = ["## Admin instructions"];
      let total = 0;

      for (const applied of snapshot.versions) {
        const row = byId.get(applied.versionId);
        if (!row) continue;

        const content = sanitizeInstructionContent(row.content);
        if (!content) continue;

        const block = `### ${applied.title} (v${applied.version})\n${content}`;
        if (total + block.length > MAX_INSTRUCTION_CHARS) break;
        blocks.push(block);
        total += block.length;
      }

      return blocks.length > 1 ? blocks.join("\n\n") : null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to assemble admin block: ${message}`);
      return null;
    }
  }
}

function sanitizeInstructionContent(content: string): string {
  const trimmed = content.trim().slice(0, MAX_SINGLE_INSTRUCTION);
  const lower = trimmed.toLowerCase();
  const forbidden = [
    "ignore previous",
    "ignore all instructions",
    "you are now dan",
    "bypass safety",
  ];
  if (forbidden.some((p) => lower.includes(p))) {
    return "";
  }
  return trimmed;
}
