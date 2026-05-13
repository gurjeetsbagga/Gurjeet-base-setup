# Memory philosophy — Auryn

---

## Purpose

Memory exists so Auryn can be **contextual**, **longitudinal**, and **useful** — not invasive, chaotic, or random.

---

## Layers (conceptual)

1. **Conversation history** — raw messages for replay, support, and model continuity (with retention policy).  
2. **Structured memory** — preferences, goals, restrictions, protocol context, product likes/dislikes, important notes — **typed fields** not only prose.  
3. **Summarized memory** — rolling summaries to limit token use while preserving meaning.  
4. **Future retrieval** — embeddings / **pgvector** (or dedicated vector store) for semantic recall of documents, logs, and user-authored content — behind a **MemoryStore** interface so orchestration stays stable.  

---

## Principles

- **Provenance:** know whether memory came from user statement, admin template, import, or inferred action — especially for compliance.  
- **Permissions:** user-private vs practice-shared vs global templates (Step 2+); enforce in API, not in the model.  
- **Minimize prompt stuffing:** retrieve **only** relevant slices per turn; summarize aggressively where safe.  
- **User agency:** support export, correction, and deletion per policy.  

---

## What memory must not become

- A dump of every message into every request  
- Unaudited “model remembers everything” without schema  
- A substitute for **medical records** or **diagnosis**  

---

## Related

- `docs/product/developer-platform-overview.md`  
- `docs/product/step-2-development.md`  
- `docs/architecture/backend-architecture.md`  
- `docs/ai/auryn-ai-master-rules.md`  
- [`structured-outputs.md`](./structured-outputs.md) · [`validation-commands.md`](./validation-commands.md)
