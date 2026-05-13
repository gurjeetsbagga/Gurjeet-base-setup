declare function setTimeout(callback: () => void, ms: number): unknown;

/**
 * Promise-based delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delayMs?: number; factor?: number } = {},
): Promise<T> {
  const { attempts = 3, delayMs = 500, factor = 2 } = options;
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await sleep(delayMs * factor ** i);
      }
    }
  }

  throw lastError;
}
