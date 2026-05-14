import { Injectable } from "@nestjs/common";
import type { ActionType, ValidationContext, ValidationResult } from "../interfaces";
import { BaseActionValidator } from "./base-action.validator";

/**
 * Validator for "medication_reminder" actions — high-risk medical action.
 * Always requires explicit user approval. AI cannot set reminders autonomously.
 */
@Injectable()
export class MedicationReminderValidator extends BaseActionValidator {
  readonly actionType: ActionType = "medication_reminder";

  protected validatePayload(
    payload: Record<string, unknown>,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    const errors: ValidationResult["errors"] = [];
    const warnings: ValidationResult["warnings"] = [];

    if (typeof payload.medicationName !== "string" || payload.medicationName.trim().length === 0) {
      errors.push({
        code: "MISSING_MEDICATION",
        field: "medicationName",
        message: "Medication name is required",
      });
    }

    if (payload.dosage !== undefined && typeof payload.dosage !== "string") {
      errors.push({ code: "INVALID_DOSAGE", field: "dosage", message: "Dosage must be a string" });
    }

    if (payload.frequency !== undefined && typeof payload.frequency !== "string") {
      errors.push({
        code: "INVALID_FREQUENCY",
        field: "frequency",
        message: "Frequency must be a string",
      });
    }

    return { errors, warnings };
  }

  protected override checkSafety(
    _payload: Record<string, unknown>,
    _context: ValidationContext,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    return {
      errors: [],
      warnings: [
        {
          code: "MEDICAL_ACTION",
          message:
            "Medication reminders are informational only. " +
            "Always follow your healthcare provider's instructions.",
        },
      ],
    };
  }
}
