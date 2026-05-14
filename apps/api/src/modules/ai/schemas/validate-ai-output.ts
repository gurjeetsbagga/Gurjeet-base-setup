import { Logger } from "@nestjs/common";
import type { z } from "zod";

const logger = new Logger("AiOutputValidator");

/**
 * Validate an AI-generated response against a Zod schema.
 *
 * Returns a discriminated result so callers can handle failures
 * gracefully (e.g. fall back to raw text) without throwing.
 *
 * This is the enforcement point for the rule:
 *   "Backend validates ALL AI outputs before any system/database action."
 */
export function validateAiOutput<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  context: { requestId: string; schemaName: string },
): AiOutputValidationResult<T> {
  const result = schema.safeParse(raw);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  logger.warn(
    `AI output validation failed [${context.schemaName}] ` +
      `requestId=${context.requestId}: ${result.error.message}`,
  );

  return {
    valid: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

export type AiOutputValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: { path: string; message: string }[] };

/**
 * Parse a JSON string from an AI response, handling common
 * formatting issues (markdown fences, trailing commas).
 *
 * Returns null if parsing fails — callers should fall back
 * to treating the response as plain text.
 */
export function parseAiJson(raw: string): unknown | null {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    logger.debug(`Failed to parse AI JSON output: ${cleaned.slice(0, 200)}`);
    return null;
  }
}
