# Coding standards — Auryn

Engineering conventions for the Auryn platform. This file is the **engineering** entry point; product, AI safety, and agent rules are layered with **[`AGENTS.md`](../../AGENTS.md)** and the documents below.

---

## Before you open a PR

1. Read **[`AGENTS.md`](../../AGENTS.md)** for non‑negotiables (product tone, PhysicianOS boundary, backend stack, AI principles).  
2. For AI-related changes, read **[`../ai/auryn-ai-master-rules.md`](../ai/auryn-ai-master-rules.md)** and **[`../ai/project-context.md`](../ai/project-context.md)** when present.  
3. **Optional:** pre-implementation validation checklist for agents and advanced work — [`../internal/validation-commands.md`](../internal/validation-commands.md). For routine PRs, follow root **`SETUP.md`** and team CI once configured (lint, typecheck, tests).  
4. For UI, follow **[`design-system.md`](design-system.md)** (tokens, semantic colors, shared primitives).

---

## TypeScript and structure

- Prefer **explicit types** on public APIs, DTOs, and anything crossing package boundaries.  
- **Avoid** `any`; use `unknown` and narrow when handling untrusted input.  
- Keep **modules cohesive**: feature logic belongs in the right `apps/*` or `packages/*` home — see [`setup-guide.md`](setup-guide.md) §2 and [`local-development.md`](local-development.md).  
- When the monorepo exists, **reuse** `packages/types` and `packages/validation` instead of duplicating contracts.

---

## Security and configuration

- **Never** commit secrets, tokens, or real `.env` files. Use **`.env.example`** to document new variable **names** only.  
- **OpenAI and other model keys** stay **server-side** (e.g. NestJS config), never in Next.js `NEXT_PUBLIC_*` or mobile bundles.  
- Validate **webhooks** and **callbacks** per architecture docs when those integrations ship.

---

## Design and UX

- **No ad-hoc colors or spacing** in feature UIs — use the design system and tokens (see [`design-system.md`](design-system.md)).  
- **Mobile-first** layouts for member-facing surfaces; align with product canon under **`docs/product/`**.

---

## Tests and quality

- Add or update **automated tests** with behavior changes when the test stack exists (unit for pure logic; integration where contracts matter).  
- Do not merge **known regressions** on `development`; keep CI green once CI is configured.

---

## Reviews

- Prefer **small PRs** with a clear description and links to docs or tickets.  
- Call out **breaking changes** to APIs or shared packages in the PR body and coordinate `packages/sdk` / consumers.

---

## Related

| Document | Role |
|----------|------|
| [`SETUP.md`](../../SETUP.md) | Clone, prerequisites, env, status |
| [`setup-guide.md`](setup-guide.md) | Extended orientation |
| [`local-development.md`](local-development.md) | Branch and monorepo workflow |
| [`troubleshooting.md`](troubleshooting.md) | Local tooling issues |

This document will grow as ESLint/Prettier configs and CI jobs land; extend it in the same PR that adds the tooling.
