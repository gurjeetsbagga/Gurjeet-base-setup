import { registerAs } from "@nestjs/config";
import { z } from "zod";

const schema = z.object({
  apiKey: z.string().min(1).optional(),
  orgId: z.string().min(1).optional(),
  model: z.string().min(1),
  embeddingModel: z.string().min(1),
  maxTokens: z.number().int().positive(),
  temperature: z.number().min(0).max(2),
  enabled: z.boolean(),
  /** Request timeout for completion calls (ms) */
  timeoutMs: z.number().int().positive(),
  /** Stream idle timeout — max time without a chunk (ms) */
  streamTimeoutMs: z.number().int().positive(),
  maxRetries: z.number().int().min(0).max(5),
  retryBaseDelayMs: z.number().int().positive(),
  /** When true, chat completions request OpenAI structured JSON (orchestrated schema) */
  useStructuredOutput: z.boolean(),
});

export type OpenAIConfig = z.infer<typeof schema>;

export const openaiConfig = registerAs("openai", (): OpenAIConfig => {
  const apiKey = process.env.OPENAI_API_KEY || undefined;

  const config = schema.parse({
    apiKey,
    orgId: process.env.OPENAI_ORG_ID || undefined,
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? "4096", 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? "0.7"),
    enabled: Boolean(apiKey),
    timeoutMs: parseInt(process.env.OPENAI_TIMEOUT_MS ?? process.env.OPENAI_TIMEOUT ?? "60000", 10),
    streamTimeoutMs: parseInt(process.env.OPENAI_STREAM_TIMEOUT_MS ?? "120000", 10),
    maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES ?? "3", 10),
    retryBaseDelayMs: parseInt(process.env.OPENAI_RETRY_BASE_DELAY_MS ?? "500", 10),
    useStructuredOutput: process.env.OPENAI_USE_STRUCTURED_OUTPUT === "true",
  });

  return Object.defineProperty(config, "toJSON", {
    value: () => ({
      model: config.model,
      embeddingModel: config.embeddingModel,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      enabled: config.enabled,
      apiKey: config.apiKey ? "[REDACTED]" : undefined,
      orgId: config.orgId ? "[REDACTED]" : undefined,
    }),
    enumerable: false,
  });
});

/**
 * Return a masked version of an API key for safe logging.
 * Shows only the last 4 characters: "sk-...xYzW"
 */
export function redactApiKey(key: string | undefined): string {
  if (!key) return "(not set)";
  if (key.length <= 8) return "[REDACTED]";
  return `${key.slice(0, 3)}...${key.slice(-4)}`;
}
