import { Injectable } from "@nestjs/common";
import type { ActionType, ValidationResult } from "../interfaces";
import { BaseActionValidator } from "./base-action.validator";

/**
 * Validator for "read_article" actions — low-risk, informational.
 * AI suggests an article; user chooses whether to open it.
 */
@Injectable()
export class ReadArticleValidator extends BaseActionValidator {
  readonly actionType: ActionType = "read_article";

  protected validatePayload(
    payload: Record<string, unknown>,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    const errors: ValidationResult["errors"] = [];
    const warnings: ValidationResult["warnings"] = [];

    if (typeof payload.title !== "string" || payload.title.trim().length === 0) {
      errors.push({ code: "MISSING_TITLE", field: "title", message: "Article title is required" });
    }

    if (payload.url !== undefined) {
      if (typeof payload.url !== "string") {
        errors.push({ code: "INVALID_URL", field: "url", message: "URL must be a string" });
      } else {
        try {
          new URL(payload.url);
        } catch {
          errors.push({ code: "INVALID_URL", field: "url", message: "URL is not valid" });
        }
      }
    }

    return { errors, warnings };
  }
}
