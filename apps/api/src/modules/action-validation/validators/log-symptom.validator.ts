import { Injectable } from "@nestjs/common";
import type {
  ActionRiskLevel,
  ActionType,
  ValidationContext,
  ValidationResult,
} from "../interfaces";
import { BaseActionValidator } from "./base-action.validator";

const MAX_SYMPTOM_LENGTH = 1000;
const SEVERITY_VALUES = ["mild", "moderate", "severe"];

/**
 * Validator for "log_symptom" actions — medium-risk health data write.
 * Ensures symptom data is well-formed and escalates severe symptoms.
 */
@Injectable()
export class LogSymptomValidator extends BaseActionValidator {
  readonly actionType: ActionType = "log_symptom";

  protected validatePayload(
    payload: Record<string, unknown>,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    const errors: ValidationResult["errors"] = [];
    const warnings: ValidationResult["warnings"] = [];

    if (typeof payload.symptom !== "string" || payload.symptom.trim().length === 0) {
      errors.push({
        code: "MISSING_SYMPTOM",
        field: "symptom",
        message: "Symptom description is required",
      });
    } else if (payload.symptom.length > MAX_SYMPTOM_LENGTH) {
      errors.push({
        code: "SYMPTOM_TOO_LONG",
        field: "symptom",
        message: `Symptom must be under ${MAX_SYMPTOM_LENGTH} characters`,
      });
    }

    if (payload.severity !== undefined && !SEVERITY_VALUES.includes(payload.severity as string)) {
      errors.push({
        code: "INVALID_SEVERITY",
        field: "severity",
        message: `Severity must be one of: ${SEVERITY_VALUES.join(", ")}`,
      });
    }

    return { errors, warnings };
  }

  protected override computeRiskLevel(
    payload: Record<string, unknown>,
    _context: ValidationContext,
  ): ActionRiskLevel {
    if (payload.severity === "severe") return "high";
    return this.defaultRiskLevel;
  }

  protected override checkSafety(
    payload: Record<string, unknown>,
    _context: ValidationContext,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    const warnings: ValidationResult["warnings"] = [];

    if (payload.severity === "severe") {
      warnings.push({
        code: "SEVERE_SYMPTOM",
        message:
          "Severe symptom reported — consider recommending professional medical consultation.",
      });
    }

    return { errors: [], warnings };
  }
}
