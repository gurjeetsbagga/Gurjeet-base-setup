/**
 * JSON Schema for OpenAI structured outputs (strict mode).
 * Kept in sync with orchestrated-response.schema.ts (Zod).
 */
export const ORCHESTRATED_RESPONSE_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    content: { type: "string", description: "User-facing response text" },
    tone: {
      type: "string",
      enum: ["calm", "supportive", "encouraging", "reflective"],
    },
    disclaimer: { type: "string" },
    escalationRequired: { type: "boolean" },
    escalation: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["none", "physician", "emergency"] },
        message: { type: "string" },
      },
      required: ["type"],
      additionalProperties: false,
    },
    proposedActions: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          actionType: {
            type: "string",
            enum: [
              "schedule_appointment",
              "log_symptom",
              "read_article",
              "start_exercise",
              "medication_reminder",
              "journal_prompt",
              "contact_provider",
              "update_recovery_plan",
              "store_memory",
              "update_preferences",
            ],
          },
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          payload: { type: "object", additionalProperties: true },
        },
        required: ["actionType", "title", "description", "priority"],
        additionalProperties: false,
      },
    },
    memoryHints: {
      type: "array",
      maxItems: 5,
      items: { type: "string" },
    },
  },
  required: ["content"],
  additionalProperties: false,
};
