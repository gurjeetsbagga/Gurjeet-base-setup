# Auryn validation commands

> **Location:** `docs/internal/` — optional deep reference for **AI agents** and **implementation-phase** validation. **Contributors:** start with root **`SETUP.md`**; you do not need this checklist to clone the repo or prepare your machine.

Central checklist for **AI agents** and **engineers** to validate architecture, governance, and setup **before** implementation work. Use this document to preserve Auryn’s long-term direction and prevent shortcut designs.

---

## What these commands are for

- **Architecture validation** — modules, boundaries, monorepo layout, separation of concerns  
- **Scalability reviews** — stateless APIs, event-ready design, migration paths (e.g. AWS, queues)  
- **AI governance checks** — structured outputs, backend validation, no client keys, guardrail precedence  
- **Setup audits** — presence of tooling configs, docs, and empty vs scaffolded workspaces  
- **Engineering readiness reviews** — alignment with product steps, design system, and safety rules  

---

## What these commands are NOT for

- **Feature implementation** — no new product behavior from this checklist alone  
- **Business logic generation** — no domain rules or workflows invented here  
- **UI development** — no screens, components, or styling work  
- **Rapid prototyping shortcuts** — no “temporary” patterns that violate documented architecture  

---

# Global validation rules

Run these **before** any step-specific command. If a rule fails, **stop** and reconcile docs or plan before coding.

1. **Read [`project-context.md`](../ai/project-context.md) first** — master narrative for what Auryn is and is not.  
2. **Read [`auryn-ai-master-rules.md`](../ai/auryn-ai-master-rules.md)** — non‑negotiable AI and platform boundaries.  
3. **Treat [`docs/product/`](../product/) as product source of truth** — Markdown summaries; originals in [`docs/raw/`](../raw/). On conflict, align Markdown with raw or escalate to product.  
4. **Never assume Auryn is a generic chatbot** — validate persistent wellness OS positioning: memory, orchestration (phased), structured actions, admin control.  
5. **Preserve PhysicianOS separation** — API-only integration; no shared DB or internal imports across products ([`docs/architecture/physicianos-separation.md`](../architecture/physicianos-separation.md)).  
6. **Validate mobile-first architecture** — layouts, tokens, and APIs usable from small screens first ([`docs/architecture/frontend-architecture.md`](../architecture/frontend-architecture.md), [`docs/engineering/design-system.md`](../engineering/design-system.md)).  
7. **Validate AI safety guardrails** — non-diagnosis, no prescribing, guardrails override model output ([`safety-guardrails.md`](../ai/safety-guardrails.md), Step 1 product doc).  
8. **Validate admin-controlled AI behavior** — master instructions, company guardrails, product/protocol rules; publish/version without redeploy for content ([`docs/product/step-1-development.md`](../product/step-1-development.md)).  
9. **Validate structured output architecture** — conversational + machine-readable channels; backend validates before side effects ([`structured-outputs.md`](structured-outputs.md)).  
10. **Validate future orchestration readiness** — orchestration module owns flow composition; tools/workflows explicit and logged ([`ai-orchestration.md`](./ai-orchestration.md), Step 3 vision).  
11. **Validate future memory / vector readiness** — retrieval behind interfaces; pgvector path documented ([`memory-philosophy.md`](memory-philosophy.md), [`docs/architecture/backend-architecture.md`](../architecture/backend-architecture.md)).  
12. **Validate design consistency** — semantic tokens, shared primitives, no random hex in feature code ([`docs/engineering/design-system.md`](../engineering/design-system.md)).  
13. **Never bypass backend validation** — no direct model → DB writes; no executing partial streamed JSON as actions.  
14. **Never expose OpenAI (or provider) keys to the frontend** — secrets only in server / secret manager ([`docs/architecture/monorepo-architecture.md`](../architecture/monorepo-architecture.md)).  
15. **Never tightly couple systems** — especially Auryn ↔ PhysicianOS; use DTOs and integration modules only.  
16. **Never optimize for short-term hacks** — no “temporary” coupling that contradicts modular, AI-native direction.  

---

## Step 1 — Project understanding command

```text
Read all Auryn documentation before touching architecture or setup.

Understand and validate:
- Auryn is a persistent AI-guided wellness platform
- Auryn is NOT a generic chatbot
- Auryn is NOT an EMR
- Auryn is NOT a diagnosis platform
- Auryn is a conversational intelligence + memory + orchestration layer

Understand:
- Step 1 scope
- Step 2 structured memory direction
- Step 3 orchestration vision
- Step 4 adaptive intelligence vision

Validate:
- PhysicianOS separation
- API-driven integration philosophy
- modular architecture direction
- admin-controlled AI philosophy
- structured outputs philosophy
- persistent memory philosophy

Reference:
- Developer Platform Overview :contentReference[oaicite:0]{index=0}
- PhysicianOS Relationship Architecture :contentReference[oaicite:1]{index=1}
- Step 1–4 Documents :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4} :contentReference[oaicite:5]{index=5}
```

**In-repo mapping (use these paths; ignore legacy `contentReference` IDs in chat exports):**

| Topic | Markdown | Raw original |
| ----- | -------- | ------------ |
| Developer Platform Overview | [`docs/product/developer-platform-overview.md`](../product/developer-platform-overview.md) | `docs/raw/hey-auryn-developer-platform-overview.docx` |
| PhysicianOS relationship | [`docs/product/physicianos-relationship.md`](../product/physicianos-relationship.md) | `docs/raw/hey-auryn-physicianos-relationship.docx` |
| Steps 1–4 | [`docs/product/step-1-development.md`](../product/step-1-development.md) … [`step-4-vision.md`](../product/step-4-vision.md) | `docs/raw/hey-auryn-step-1.docx` … `hey-auryn-step-4.docx` |
| Index / reading order | [`docs/product/INDEX.md`](../product/INDEX.md) | — |

---

## Step 2 — Foundation validation command

```text
Validate whether current repository structure correctly supports:

- scalable monorepo architecture
- AI-native backend architecture
- mobile-first frontend architecture
- shared design system
- future orchestration systems
- structured memory systems
- future vector retrieval
- scalable integrations

Check:
- apps/
- packages/
- docs/
- infrastructure/
- prisma/

Validate missing critical setup items:
- turbo.json
- pnpm-workspace.yaml
- package.json
- .gitignore
- README.md
- coding standards
- branch strategy
- onboarding docs

DO NOT START FEATURE DEVELOPMENT.
ONLY validate setup readiness.
```

**Doc cross-check:** [`docs/architecture/monorepo-architecture.md`](../architecture/monorepo-architecture.md), [`docs/engineering/setup-guide.md`](../engineering/setup-guide.md), [`docs/engineering/coding-standards.md`](../engineering/coding-standards.md), [`docs/engineering/branch-strategy.md`](../engineering/branch-strategy.md).

---

## Step 3 — Frontend architecture validation command

```text
Validate frontend architecture alignment with Auryn product vision.

Confirm:
- Next.js
- TypeScript
- Tailwind CSS
- mobile-first architecture
- reusable component strategy
- scalable feature-based architecture
- centralized design tokens
- shared UI primitives

Auryn UI must feel:
- calm
- premium
- conversational
- wellness-focused
- emotionally supportive

Avoid:
- generic chatbot UI
- inconsistent components
- random colors
- desktop-first layouts

Validate future readiness for:
- conversational UI
- memory screens
- collections
- dashboards
- recovery workflows
- admin panels
- streaming AI responses

Reference UI direction:
:contentReference[oaicite:6]{index=6}
```

**In-repo mapping:** UI reference PDF → [`docs/product/app-reference/hey-auryn-app-reference.pdf`](../product/app-reference/hey-auryn-app-reference.pdf) (duplicate under `docs/raw/hey-auryn-app-reference.pdf`). Architecture: [`docs/architecture/frontend-architecture.md`](../architecture/frontend-architecture.md), [`docs/engineering/design-system.md`](../engineering/design-system.md).

---

## Step 4 — Backend architecture validation command

```text
Validate backend architecture for enterprise-grade scalability.

Required stack:
- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM

Validate modular structure:
- ai
- auth
- memory
- conversations
- recovery
- physicianos
- orchestration
- admin
- recommendations

Ensure:
- service boundaries exist
- AI orchestration is separated
- OpenAI is backend-only
- no frontend API key exposure
- no tightly coupled architecture

Reject:
- flat Express-style structure
- frontend-direct AI architecture
- monolithic backend logic

Validate preparation for:
- structured outputs
- function calling
- streaming responses
- audit logging
- RBAC
- future queues/workflows
```

**Doc cross-check:** [`docs/architecture/backend-architecture.md`](../architecture/backend-architecture.md) (includes **`users`** module in target layout), [`docs/architecture/physicianos-separation.md`](../architecture/physicianos-separation.md).

---

## Step 5 — AI architecture validation command

```text
Validate AI architecture alignment with Auryn long-term vision.

Confirm support/planning for:
- OpenAI Responses API
- Structured Outputs
- Function Calling
- Streaming Responses
- backend validation layer
- admin-controlled prompts
- prompt versioning
- audit logging
- memory retrieval

Ensure:
- OpenAI NEVER directly modifies database
- all AI actions require backend validation
- AI outputs are schema-safe
- AI actions are logged
- safety guardrails override AI behavior

Validate future readiness for:
- structured memory
- pgvector
- retrieval systems
- contextual memory
- orchestration agents
- adaptive intelligence
```

**Doc cross-check:** [`ai-orchestration.md`](./ai-orchestration.md), [`structured-outputs.md`](structured-outputs.md), [`safety-guardrails.md`](../ai/safety-guardrails.md), [`docs/product/recommended-tech-stack.md`](../product/recommended-tech-stack.md) (Responses API + stack research).

---

## Step 6 — Memory architecture validation command

```text
Validate memory architecture direction.

Auryn memory must support:
- persistent memory
- structured memory
- contextual retrieval
- summarized memory
- future vector search
- custom collections
- user state systems

Validate preparation for:
- memory summaries
- retrieval pipelines
- pgvector integration
- semantic search
- user memory permissions

Memory should feel:
- organized
- contextual
- longitudinal
- personalized

NOT:
- invasive
- random
- chaotic
```

**Doc cross-check:** [`memory-philosophy.md`](memory-philosophy.md), [`docs/product/step-2-development.md`](../product/step-2-development.md), backend “Memory and future pgvector” in [`backend-architecture.md`](../architecture/backend-architecture.md).

---

## Step 7 — Design system validation command

```text
Validate design system consistency setup.

Confirm:
- centralized color tokens
- reusable typography system
- shared spacing system
- shared component primitives
- semantic color naming
- mobile-first design philosophy

Ensure:
- no random hex values
- no duplicated styling
- no inconsistent component behavior

Auryn design must remain:
- calm
- premium
- modern
- wellness-focused
- emotionally comfortable

Validate future readiness for:
- shared UI package
- cross-platform consistency
- scalable component system
- design token architecture
```

**Doc cross-check:** [`docs/engineering/design-system.md`](../engineering/design-system.md), [`AGENTS.md`](../../AGENTS.md) (Design system & UI).

---

## Step 8 — Scalability validation command

```text
Validate long-term scalability direction.

Confirm preparation for:
- AWS migration
- event-driven architecture
- queue systems
- orchestration systems
- recommendation systems
- analytics pipelines
- integrations
- multi-system coordination
- adaptive intelligence

Validate future readiness for:
- Temporal
- BullMQ
- Redis
- Kafka
- pgvector
- Pinecone
- Weaviate
- LangGraph

Ensure current setup does NOT block future Step 3 and Step 4 evolution.
```

**Doc cross-check:** [`docs/architecture/monorepo-architecture.md`](../architecture/monorepo-architecture.md), [`docs/engineering/deployment-strategy.md`](../engineering/deployment-strategy.md), [`docs/architecture/backend-architecture.md`](../architecture/backend-architecture.md) (event-ready, AWS readiness). Technology choices (Temporal, Kafka, etc.) are **candidates** — confirm with ADR before standardizing.

---

## Step 9 — Final audit command

```text
Perform a complete project foundation audit.

Return:
1. What is correctly configured
2. What is missing
3. What violates architecture direction
4. Scalability concerns
5. AI architecture concerns
6. Design consistency concerns
7. Immediate setup fixes required
8. Recommended next setup steps BEFORE development begins

IMPORTANT:
DO NOT IMPLEMENT FEATURES.
DO NOT BUILD BUSINESS LOGIC.
DO NOT START UI DEVELOPMENT.

This audit is ONLY for:
- foundation
- architecture
- scalability
- engineering readiness
- AI-native platform alignment
```

**Pass criteria:** Written report covering all **eight** numbered items plus explicit **go / no-go**; no implementation unless a separate, explicit task authorizes it.

---

# Recommended AI workflow

Example sequence for agents:

1. Read [`project-context.md`](../ai/project-context.md).  
2. Read [`auryn-ai-master-rules.md`](../ai/auryn-ai-master-rules.md).  
3. Read [`docs/product/INDEX.md`](../product/INDEX.md) and relevant **Step** docs.  
4. Run **Step 1** (project understanding) → **Step 2** (foundation) → **Steps 3–8** as applicable to the task surface (web, api, AI, memory, design, scale).  
5. Run **Step 9** (final audit) and record go/no-go.  
6. **Only after approval**, start implementation tasks explicitly authorized by the user.  

---

# Principal-level engineering note

The **repository** — especially `docs/`, `AGENTS.md`, and governed ADRs — should function as:

- The **engineering memory system** (why decisions exist)  
- The **architecture governance system** (what is allowed / forbidden)  
- The **AI alignment system** (safety, structure, admin control)  
- The **onboarding system** (how new humans and agents ramp safely)  

Auryn should be built as:

- **AI-native** — structured outputs, tools, streaming, server validation  
- **Modular** — Nest modules, packages, clear integration seams  
- **Scalable** — stateless, event-ready, cloud-portable configuration  
- **Orchestration-ready** — explicit composition, not chat-only logic  
- **Memory-aware** — structured + retrievable + future vector path  
- **Future adaptive intelligence platform** — phased toward prediction and autonomy **within** governance  

Auryn must **not** be reduced to:

- A **simple chatbot wrapper**  
- **Tightly coupled** healthcare software spanning Auryn and PhysicianOS internals  
- **Shortcut MVP architecture** that trades away validation, separation, or safety for speed  

This document should be **updated** when platform-wide rules change — keep it the single entry point for pre-development validation.
