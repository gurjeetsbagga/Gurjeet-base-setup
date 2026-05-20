"use strict";

/**
 * Exponential backoff retry helper for pre-boot DB checks (Railway cold starts).
 */

function backoffDelayMs(attemptIndex, options = {}) {
  const initialMs = options.initialDelayMs ?? 2_000;
  const maxMs = options.maxDelayMs ?? 30_000;
  return Math.min(maxMs, initialMs * 2 ** attemptIndex);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {() => Promise<unknown>} fn
 * @param {{
 *   maxRetries?: number;
 *   initialDelayMs?: number;
 *   maxDelayMs?: number;
 *   logPrefix?: string;
 *   label?: string;
 * }} [options]
 * @returns {Promise<unknown>}
 */
async function retryWithBackoff(fn, options = {}) {
  const maxRetries = options.maxRetries ?? 5;
  const logPrefix = options.logPrefix ?? "[api:db]";
  const label = options.label ?? "Database connection";

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);

      if (attempt >= maxRetries) {
        break;
      }

      const delayMs = backoffDelayMs(attempt - 1, options);
      console.log(
        `${logPrefix} ${label} attempt ${attempt}/${maxRetries} failed.`,
      );
      console.log(`${logPrefix} Retrying in ${Math.round(delayMs / 1000)}s...`);
      if (process.env.DB_READINESS_VERBOSE === "1") {
        console.log(`${logPrefix} Last error: ${message}`);
      }
      await sleep(delayMs);
    }
  }

  throw lastError;
}

module.exports = {
  backoffDelayMs,
  sleep,
  retryWithBackoff,
};
