import { Logger } from "@nestjs/common";

const logger = new Logger("AiRetry");

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  /** Return true to retry this error */
  isRetryable?: (error: unknown) => boolean;
}

const DEFAULT_RETRYABLE = (error: unknown): boolean => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("timeout") || msg.includes("abort")) return true;
    if (msg.includes("rate limit") || msg.includes("429")) return true;
    if (msg.includes("503") || msg.includes("502") || msg.includes("500")) return true;
    if (msg.includes("econnreset") || msg.includes("network")) return true;
  }
  return false;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff with jitter for transient OpenAI failures.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const isRetryable = options.isRetryable ?? DEFAULT_RETRYABLE;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= options.maxAttempts || !isRetryable(error)) {
        throw error;
      }
      const delay = Math.min(
        options.baseDelayMs * 2 ** (attempt - 1) + Math.random() * 200,
        options.maxDelayMs,
      );
      logger.warn(`Retry attempt ${attempt}/${options.maxAttempts} after ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}
