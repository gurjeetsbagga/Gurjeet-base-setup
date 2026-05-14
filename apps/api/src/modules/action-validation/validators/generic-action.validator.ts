import { Injectable } from "@nestjs/common";
import type { ActionType, ValidationResult } from "../interfaces";
import { BaseActionValidator } from "./base-action.validator";

/**
 * Fallback validator for action types that don't have a dedicated validator yet.
 *
 * Performs basic payload shape checks and uses the risk map defaults.
 * As the product matures, each action type should get its own validator
 * that replaces the generic one.
 */
@Injectable()
export class GenericActionValidator extends BaseActionValidator {
  readonly actionType: ActionType = "journal_prompt";

  protected validatePayload(
    payload: Record<string, unknown>,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    const errors: ValidationResult["errors"] = [];

    if (payload === null || typeof payload !== "object") {
      errors.push({ code: "INVALID_PAYLOAD", message: "Payload must be a non-null object" });
    }

    return { errors, warnings: [] };
  }
}
