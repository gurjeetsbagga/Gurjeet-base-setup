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
