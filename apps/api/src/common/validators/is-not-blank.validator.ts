import { registerDecorator, ValidationOptions } from "class-validator";

/**
 * Validates that a string is not blank (not purely whitespace).
 *
 * Stricter than @IsNotEmpty — rejects strings that contain only
 * spaces, tabs, or newlines.
 *
 * Usage:
 *   @IsNotBlank()
 *   title: string;
 */
export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isNotBlank",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === "string" && value.trim().length > 0;
        },
        defaultMessage() {
          return `${propertyName} must not be blank`;
        },
      },
    });
  };
}
