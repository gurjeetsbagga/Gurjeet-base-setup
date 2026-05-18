import type { Prisma } from "@prisma/client";
import type { InstructionSnapshot } from "../../ai/prompts/instruction-snapshot.service";
import type { AppliedInstructionVersionRef, MessageMetadata } from "../interfaces";

export function instructionAuditFields(snapshot: InstructionSnapshot): {
  instructionVersionId: string | null;
  metadata: Prisma.InputJsonValue;
} {
  return {
    instructionVersionId: snapshot.primaryVersionId,
    metadata: {
      appliedInstructionVersions: toAppliedRefs(snapshot),
    } as unknown as Prisma.InputJsonValue,
  };
}

export function mergeMessageMetadata(
  base: MessageMetadata,
  snapshot: InstructionSnapshot,
): MessageMetadata {
  return {
    ...base,
    appliedInstructionVersions: toAppliedRefs(snapshot),
  };
}

function toAppliedRefs(snapshot: InstructionSnapshot): AppliedInstructionVersionRef[] {
  return snapshot.versions.map((v) => ({
    instructionId: v.instructionId,
    versionId: v.versionId,
    version: v.version,
    slug: v.slug,
    title: v.title,
    category: v.category,
    priority: v.priority,
  }));
}
