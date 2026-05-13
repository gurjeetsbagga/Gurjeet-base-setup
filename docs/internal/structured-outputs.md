# Structured outputs & AI actions

---

## Why

Auryn returns **two channels**:

1. **Natural language** for the user (warm, clear, on-brand).  
2. **Machine-readable actions** the **backend** validates and executes (preferences, memory updates, collections, workflows in later steps).

This prevents “chat said it did it” without system truth and keeps OpenAI from being a **database driver**.

---

## Requirements

- **JSON Schema** or equivalent (Zod → JSON Schema, class-validator DTOs) for any model output consumed by clients or executors.  
- **Reject-on-parse-fail:** if the model emits invalid JSON, retry with repair prompt or fall back to safe conversational response **without** executing actions.  
- **Allow-list** action `type` strings; unknown types → log + no-op + user-visible graceful message.  
- **Idempotency** keys for mutating actions where duplicates would harm UX.  
- **Streaming:** buffer until action frame complete or use delimited frames; never execute partial JSON.  

---

## OpenAI capabilities (reference)

Structured Outputs, function/tool calling, streaming — see OpenAI docs for current API names; wrap behind `packages/ai` so provider swaps are localized.

---

## Related

- [`ai-orchestration.md`](./ai-orchestration.md)  
- [`docs/product/step-1-development.md`](../product/step-1-development.md), [`docs/product/step-2-development.md`](../product/step-2-development.md)  
- [`docs/architecture/backend-architecture.md`](../architecture/backend-architecture.md)
