# Internal documentation — `docs/internal/`

This folder holds **optional, deep-reference** material: AI validation checklists, extended architecture notes, and experimental planning adjacent to the main product and architecture docs.

## Who this is for

- **AI assistants** and senior engineers running pre-implementation validation  
- **Architects** tracing orchestration, structured outputs, and memory design  
- **Personal / team reference** that should not clutter default contributor onboarding  

## Who can skip it (initially)

**New team members** completing day-one setup should follow, in order:

1. Root **[`SETUP.md`](../../SETUP.md)**  
2. **[`docs/engineering/coding-standards.md`](../engineering/coding-standards.md)**  
3. **[`docs/engineering/branch-strategy.md`](../engineering/branch-strategy.md)**  

Then **[`AGENTS.md`](../../AGENTS.md)** and **[`docs/ai/project-context.md`](../ai/project-context.md)** as your role requires. Return to `docs/internal/` when you work on AI pipelines, orchestration, or schema-heavy features.

## Contents (current)

| File | Purpose |
|------|---------|
| [`validation-commands.md`](validation-commands.md) | Pre-implementation validation checklist (Steps 1–9). |
| [`memory-philosophy.md`](memory-philosophy.md) | Memory layers and longitudinal context. |
| [`structured-outputs.md`](structured-outputs.md) | Dual-channel (conversational + machine-readable) responses. |
| [`ai-orchestration.md`](ai-orchestration.md) | Orchestration layers and server-side flow composition. |

## Governance

- **Do not delete** internal docs without an explicit decision; move or archive instead.  
- **Do not** move product canon or mandatory safety rules here unless leadership agrees they are optional for all engineers. Core AI rules remain under **`docs/ai/`** (e.g. `auryn-ai-master-rules.md`, `safety-guardrails.md`).  
- When adding new internal notes, link them from [`docs/references/INDEX.md`](../references/INDEX.md) under the **Internal** section.
