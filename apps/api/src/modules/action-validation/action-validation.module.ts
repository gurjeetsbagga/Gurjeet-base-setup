import { Module } from "@nestjs/common";
import { ActionValidationController } from "./action-validation.controller";
import { ActionValidationService } from "./action-validation.service";
import {
  ReadArticleValidator,
  LogSymptomValidator,
  MedicationReminderValidator,
  GenericActionValidator,
} from "./validators";

/**
 * Action Validation module — the enforcement boundary between
 * AI-proposed actions and system execution.
 *
 * Guarantees:
 *   - AI output is NEVER trusted for side effects
 *   - Every action is schema-validated and safety-checked
 *   - High-risk actions require explicit human approval
 *   - All actions are auditable (propose → validate → approve → execute)
 *
 * Exports ActionValidationService for use by ConversationsModule
 * and other orchestration consumers.
 */
@Module({
  controllers: [ActionValidationController],
  providers: [
    ActionValidationService,
    ReadArticleValidator,
    LogSymptomValidator,
    MedicationReminderValidator,
    GenericActionValidator,
  ],
  exports: [ActionValidationService],
})
export class ActionValidationModule {}
