/**
 * Throws if `condition` is falsy. Use for runtime preconditions.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}

/**
 * Exhaustiveness check for discriminated unions.
 *
 *   switch (action.type) {
 *     case "A": ...
 *     case "B": ...
 *     default: assertNever(action.type);
 *   }
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${String(value)}`);
}
