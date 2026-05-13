# AI orchestration architecture — Auryn

**Goal:** Auryn behaves as an **AI-native wellness platform**, not a chat-only client.

---

## Layers

| Layer | Responsibility |
| ----- | -------------- |
| **Client (web/mobile)** | Renders messages, streams tokens, displays structured cards; **never** holds provider secrets. |
| **`packages/ai` (library)** | Provider adapters, streaming helpers, schema parsing, **pure** transforms — **no DB**, **no secrets** in shared code paths used by clients. |
| **`apps/api` — `modules/orchestration/`** | Composes model calls, tools, memory retrieval, recommendations, and policy — **authoritative** business orchestration. |
| **`modules/ai/`** | Low-level provider calls, model selection, telemetry hooks. |
| **`modules/conversations/`** | Persistence of threads/messages; links to instruction versions. |
| **`modules/memory/`** | Read/write structured memory behind interfaces (future vector retrieval). |
| **`modules/admin/`** | Instruction versions, guardrails, feature flags, publish workflow. |

---

## Structured actions

All mutating or sensitive effects flow through **validated action DTOs** (see [`structured-outputs.md`](./structured-outputs.md)). The orchestration layer maps tool/function outputs → domain commands → transactions.

---

## Streaming

SSE or WebSocket (ADR) from API to clients; orchestration remains server-side so partial streams can still attach to final validated persistence events.

---

## Multi-agent / workflow future

Keep orchestration **pluggable**: swap single-model calls for multi-step graphs without rewriting clients — stable external API contracts.

---

## Related

- [`docs/ai/auryn-ai-master-rules.md`](../ai/auryn-ai-master-rules.md)  
- [`docs/architecture/backend-architecture.md`](../architecture/backend-architecture.md)  
- [`docs/product/step-2-development.md`](../product/step-2-development.md), [`step-3-vision.md`](../product/step-3-vision.md)  
