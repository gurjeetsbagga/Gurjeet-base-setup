import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { MemoryService } from "../memory/memory.service";
import type { SystemPromptContext } from "./interfaces";

/**
 * Builds SystemPromptContext from user profile + Private Brain memory.
 */
@Injectable()
export class PromptContextBuilder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly memory: MemoryService,
  ) {}

  async build(
    userId: string,
    latestUserMessage: string,
    extra?: Partial<SystemPromptContext>,
  ): Promise<SystemPromptContext> {
    const context: SystemPromptContext = {
      userId,
      ...extra,
    };

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (user) {
        const nameFromProfile = [user.profile?.firstName, user.profile?.lastName]
          .filter(Boolean)
          .join(" ");
        context.displayName = user.displayName ?? (nameFromProfile || undefined);
        context.onboardingStatus = user.onboardingStatus;

        if (user.profile) {
          const p = user.profile;
          const recoveryParts: string[] = [];
          if (p.wellnessGoal) recoveryParts.push(`Wellness goal: ${p.wellnessGoal}`);
          if (p.recoveryCategory) recoveryParts.push(`Recovery area: ${p.recoveryCategory}`);
          if (p.activeProtocol) recoveryParts.push(`Active protocol: ${p.activeProtocol}`);
          if (p.restrictionsAllergies) {
            recoveryParts.push(`Restrictions/allergies: ${p.restrictionsAllergies}`);
          }
          if (recoveryParts.length > 0) {
            context.recoveryContext = recoveryParts.join("\n");
          }
          if (p.conversationSummary) {
            context.memorySummary = p.conversationSummary;
          }
        }
      }
    }

    try {
      const memoryContext = await this.memory.buildContext(userId, latestUserMessage, 5);
      if (memoryContext.summary) {
        const existing = context.memorySummary ?? "";
        context.memorySummary = existing
          ? `${existing}\n\nRelevant memories:\n${memoryContext.summary}`
          : memoryContext.summary;
      }
    } catch {
      /* optional */
    }

    return context;
  }
}
