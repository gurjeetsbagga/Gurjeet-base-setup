const SENSITIVE_KEY_PATTERN =
  /password|secret|token|authorization|api[_-]?key|jwt|bearer|cookie|credential|embeddings?/i;

const MAX_AI_TEXT_LENGTH_DEV = 500;
const MAX_AI_TEXT_LENGTH_PROD = 120;

/** Keys and patterns that must never appear in logs. */
export const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "headers.authorization",
  "headers.cookie",
  "password",
  "passwordHash",
  "refreshToken",
  "accessToken",
  "apiKey",
  "OPENAI_API_KEY",
  "API_JWT_SECRET",
  "DATABASE_URL",
  "authorization",
  "token",
  "secret",
  "embeddings",
  "embedding",
];

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function truncateForLog(text: string, isProduction: boolean): string {
  const max = isProduction ? MAX_AI_TEXT_LENGTH_PROD : MAX_AI_TEXT_LENGTH_DEV;
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…[truncated]`;
}

export function redactSensitive<T>(value: T, depth = 0): T {
  if (depth > 8) return "[MaxDepth]" as T;
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1)) as T;
  }
  if (typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      out[key] = "[REDACTED]";
    } else {
      out[key] = redactSensitive(val, depth + 1);
    }
  }
  return out as T;
}

export interface AiMessageLogShape {
  role: string;
  contentLength: number;
  contentPreview?: string;
}

/** Safe AI message summary for audit logs (never full medical content in production). */
export function summarizeAiMessages(
  messages: Array<{ role: string; content: string }>,
  options: { includePreview: boolean; isProduction: boolean },
): AiMessageLogShape[] {
  return messages.map((m) => ({
    role: m.role,
    contentLength: m.content.length,
    ...(options.includePreview
      ? { contentPreview: truncateForLog(m.content, options.isProduction) }
      : {}),
  }));
}
