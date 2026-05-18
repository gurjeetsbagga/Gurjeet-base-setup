import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  AiCompletionRequest,
  AiCompletionResponse,
  AiStreamChunk,
  SystemPromptContext,
} from "../conversations/interfaces";
import type { MessageMetadata } from "../conversations/interfaces/message.interface";
import { ActionValidationService } from "../action-validation/action-validation.service";
import type { ProposeActionDto } from "../action-validation/dto/propose-action.dto";
import type { NormalizedAiOrchestratedResponse } from "./schemas/orchestrated-response.schema";
import { AiService } from "./ai.service";

export interface OrchestrationOptions {
  structuredOutput?: boolean;
  instructionSnapshot?: AiCompletionRequest["instructionSnapshot"];
}

/**
 * Secure AI orchestration facade — single entry for conversation flows.
 *
 * AI never writes to the database; ConversationsService persists messages.
 * Proposed actions pass through ActionValidationService only.
 */
@Injectable()
export class AiOrchestrationService {
  private readonly logger = new Logger(AiOrchestrationService.name);

  constructor(
    private readonly ai: AiService,
    private readonly actionValidation: ActionValidationService,
  ) {}

  async complete(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
    _options?: OrchestrationOptions,
  ): Promise<AiCompletionResponse> {
    const structured =
      _options?.structuredOutput ?? request.structuredOutput ?? this.ai.structuredOutputEnabled;

    return this.ai.complete(
      {
        ...request,
        structuredOutput: structured,
        instructionSnapshot: _options?.instructionSnapshot ?? request.instructionSnapshot,
      },
      promptContext,
    );
  }

  stream(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
    options?: OrchestrationOptions,
  ): AsyncGenerator<AiStreamChunk> {
    return this.ai.stream(
      {
        ...request,
        instructionSnapshot: options?.instructionSnapshot ?? request.instructionSnapshot,
      },
      promptContext,
    );
  }

  /**
   * Run validated action proposals after the assistant message is persisted.
   */
  async finalizeProposedActions(
    userId: string,
    conversationId: string,
    messageId: string,
    metadata: MessageMetadata,
  ): Promise<MessageMetadata> {
    const structured = metadata.orchestration?.structured as
      | NormalizedAiOrchestratedResponse
      | undefined;
    const actions = structured?.proposedActions;

    if (!actions?.length) {
      return {
        ...metadata,
        memorySignals: structured?.memoryHints,
        tone: structured?.tone,
        disclaimer: structured?.disclaimer,
        escalation: structured?.escalation,
      };
    }

    const requestId = randomUUID();
    const proposedActionIds: string[] = [];

    for (const action of actions) {
      try {
        const dto: ProposeActionDto = {
          type: action.actionType,
          conversationId,
          messageId,
          description: `${action.title}: ${action.description}`,
          payload: (action.payload ?? {}) as Record<string, unknown>,
          priority: action.priority,
        };
        const proposed = await this.actionValidation.proposeAction(userId, dto, requestId);
        if (proposed.status !== "rejected") {
          proposedActionIds.push(proposed.id);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Action proposal skipped: ${message}`);
      }
    }

    return {
      ...metadata,
      proposedActionIds,
      memorySignals: structured?.memoryHints,
      tone: structured?.tone,
      disclaimer: structured?.disclaimer,
      escalation: structured?.escalation,
    };
  }

  get providerName(): string {
    return this.ai.providerName;
  }

  get usesLiveOpenAi(): boolean {
    return this.ai.usesLiveOpenAi;
  }
}
