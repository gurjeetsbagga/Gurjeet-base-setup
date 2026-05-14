import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

/**
 * Validates that a string is safe for processing by AI models.
 *
 * Rejects:
 * - Null bytes (\x00) — can cause parsing issues in downstream systems
 * - Excessive whitespace-only content (must have non-whitespace chars)
 * - Content exceeding a configurable max length
 *
 * Does NOT reject:
 * - Unicode, emoji, multi-line text (these are valid user inputs)
 * - HTML/markdown (sanitization is a separate concern at the rendering layer)
 *
 * Usage:
 *   @IsSafeText({ maxLength: 10000 })
 *   message: string;
 */
export function IsSafeText(
  options: { maxLength?: number } = {},
  validationOptions?: ValidationOptions,
) {
  const maxLength = options.maxLength ?? 50000;

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isSafeText",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxLength],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== "string") return false;
          if (value.includes("\x00")) return false;
          if (value.trim().length === 0) return false;
          const limit = args.constraints[0] as number;
          if (value.length > limit) return false;
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const limit = args.constraints[0] as number;
          return `${args.property} must be non-empty text without null bytes and at most ${limit} characters`;
        },
      },
    });
  };
}
