# Auryn — Developer setup guide

This document is the **primary engineering deep-dive** for orientation. **New contributors:** start with the root **[`SETUP.md`](../../SETUP.md)**, then return here for extended context.

**Companion documents**

- Day-to-day workflow and expectations: [`local-development.md`](local-development.md)  
- Conventions and PR expectations: [`coding-standards.md`](coding-standards.md)  
- Common environment issues: [`troubleshooting.md`](troubleshooting.md)  
- Repository tree (foundation): [`../../REPOSITORY-STRUCTURE.md`](../../REPOSITORY-STRUCTURE.md)  
- Full documentation map (when present): [`../references/INDEX.md`](../references/INDEX.md)

---

## 1. Project overview

**Primary references (read before implementation work):**

- **AI and platform context:** [`docs/ai/project-context.md`](../ai/project-context.md) — goals, boundaries, and how Auryn should behave as an AI-native system.
- **Product canon:** **`docs/product/`** — vision, journeys, and UX principles; start with [`docs/product/INDEX.md`](../product/INDEX.md) when present in your checkout.

### What Auryn is

**Auryn** (Hey Auryn™) is an **AI-native wellness and health intelligence platform**: calm, personalized, recovery-aware, and built around conversational guidance, memory-aware context, and orchestrated experiences across web and mobile. The product vision, journeys, and non‑negotiable experience principles live under **`docs/product/`** (start with [`docs/product/INDEX.md`](../product/INDEX.md) when available).

### What Auryn is not

- **Not** a generic chat wrapper or undifferentiated “AI app.”
- **Not** a replacement for clinicians or emergency care; outputs are **not** diagnosis-oriented.
- **Not** a monolith that merges external clinical systems into Auryn’s core domain.

### AI-native platform philosophy

- **Structured, typed, predictable outputs** where possible (schemas, function calling, streaming when appropriate).
- **Server-side** model access and secrets; clients stay thin.
- **Guardrails** aligned with wellness and medical-adjacent UX — see AI governance in [`docs/ai/auryn-ai-master-rules.md`](../ai/auryn-ai-master-rules.md) and [`docs/ai/project-context.md`](../ai/project-context.md) when those files are present in your checkout.

### PhysicianOS separation philosophy

**PhysicianOS** is a **separate product/system**. Auryn integrates **only through explicit APIs and integration boundaries** (e.g. `apps/api` module layout reserves `physicianos/` and `integrations/`). No tight coupling of Auryn domain logic to PhysicianOS internals. When present, read **`docs/architecture/physicianos-separation.md`**.

### Long-term orchestration direction

The backend is intended to own **orchestration**, contracts, and AI/memory workflows; frontends remain **interchangeable presentation layers**. Event-ready, modular services support future multi-step and multi-agent flows without rewriting core domains. Details: **`docs/architecture/backend-architecture.md`** and monorepo notes in **`docs/architecture/monorepo-architecture.md`** (when available).

---

## 2. Repository architecture

High-level layout (foundation phase — folders and docs; applications not scaffolded):

| Path | Purpose |
|------|---------|
| **`apps/`** | Runnable applications: web, mobile, API, admin. |
| **`packages/`** | Shared libraries: design tokens, UI primitives, types, validation, AI helpers, prompts, memory abstractions, SDK, config presets, utilities. |
| **`infrastructure/`** | Hosting and deployment notes (Vercel, Railway, Supabase, Docker, AWS placeholders). |
| **`prisma/`** | Database schema home (PostgreSQL via Prisma); models and migrations arrive in implementation phase. |
| **`docs/`** | Product canon, architecture, AI rules, engineering standards, references. |

### Applications under `apps/`

| App | Role |
|-----|------|
| **`web`** | Public / member web experience — planned **Next.js**, TypeScript, Tailwind. |
| **`mobile`** | Member mobile — planned **React Native + Expo**. |
| **`api`** | **NestJS** HTTP API, orchestration, auth, AI boundaries, integrations — planned stack. |
| **`admin`** | Internal operations and configuration UI — planned **Next.js** (or aligned stack). |

### Shared `packages/`

Shared code keeps contracts and UI consistent across surfaces: **design-system** (tokens, Tailwind preset), **ui** (primitives for web/admin), **types** (DTOs and TS contracts), **validation** (e.g. Zod schemas), **ai** (provider-agnostic helpers — no secrets in shared paths), **prompts**, **memory** (retrieval interfaces), **sdk** (typed client for the API), **config** (ESLint/Prettier/tsconfig presets when added), **utils** (pure helpers).

See also: [`../../packages/README.md`](../../packages/README.md).

---

## 3. Technology stack (planned)

Target stack by layer (implementation phase — not all tooling exists in the repo yet):

**Frontend**

- **Next.js**
- **TypeScript**
- **Tailwind CSS**

**Mobile**

- **React Native** + **Expo**

**Backend**

- **NestJS**
- **PostgreSQL**
- **Prisma ORM**

**AI**

- **OpenAI API** (server-side; provider details per architecture)
- **Structured outputs** (typed, schema-constrained responses)
- **Function calling** (tool use against approved server contracts)
- **Streaming responses** (where UX requires partial tokens / progress)

**Infrastructure**

- **Vercel** — web and admin frontends (planned)
- **Railway** — API and related services (planned)
- **Supabase** — auth / data services as defined in architecture (planned)
- **AWS** — **later**, for selected workloads (storage, queues, etc., per future architecture)

| Layer (summary) | Choices |
|-----------------|---------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS |
| **Mobile** | React Native + Expo |
| **Backend** | NestJS, PostgreSQL, Prisma ORM |
| **AI** | OpenAI API + structured outputs + function calling + streaming |
| **Infrastructure** | Vercel, Railway, Supabase; AWS later |

Until the monorepo is wired with `package.json` / workspace config, treat the above as the **target** stack, not a guarantee that every tool is installed locally.

---

## 4. Required local software

Install these **before** implementation-phase dependency installs:

| Tool | Notes |
|------|--------|
| **Git** | Required for clone, branch workflow, and code review. |
| **Node.js** | **LTS recommended** (e.g. **22.x LTS** or current team-pinned LTS — align with `engines` in root `package.json` when it exists). |
| **pnpm** | Planned package manager for the monorepo (`pnpm install`, `pnpm dev`, filters). |
| **Docker** | **Optional** — useful for local PostgreSQL or service emulation later. |
| **PostgreSQL** | **Optional initially** — required once API + Prisma migrations are active. |
| **Expo Go** | **Future** — for mobile development once `apps/mobile` is scaffolded. |
| **VS Code or Cursor** | **Recommended** — TypeScript, ESLint/Prettier, and Prisma extensions help. |

---

## 5. Repository setup instructions

### Clone

Replace the URL with your team’s canonical remote (SSH or HTTPS).

```bash
git clone <repository-url>
cd auryn
```

### Branch

Use the branch model in [§8 Branch strategy](#8-branch-strategy). Typical first checkout:

```bash
git checkout development
git pull
```

### Install dependencies (future)

**Not active yet** — there is no root `pnpm-workspace.yaml` / app `package.json` in the foundation-only phase. When the workspace is initialized:

```bash
pnpm install
```

### Environment file

Copy the example env file and fill values locally (never commit secrets):

```bash
cp .env.example .env
```

See [§6 Environment variables](#6-environment-variables).

---

## 6. Environment variables

**Usage:** copy the tracked template to a local file (never commit `.env`):

```bash
cp .env.example .env
```

Authoritative **variable names and comments**: **`.env.example`** at repository root. Update `.env` only on your machine; keep `.env.example` in sync when adding new **non-secret** keys the team must know about.

| Area | Typical variables (names only) | Notes |
|------|-------------------------------|--------|
| **Database** | `DATABASE_URL` | PostgreSQL connection string for Prisma. |
| **OpenAI** | `OPENAI_API_KEY` | **Server-side only** in API services; never in mobile or public web bundles. |
| **App URLs** | e.g. `NEXT_PUBLIC_APP_URL` | Public web base URL when Next.js apps exist. |
| **Supabase** | URL and anon/service keys (as designed) | Only if/when Supabase is integrated per architecture docs. |
| **AWS** | Region, credentials, or role-based config | **Later** — document per service when introduced. |

**Do not** paste real keys into issues, PRs, or chat. Rotate any key that was ever exposed.

---

## 7. Running applications (future)

> **Applications are not scaffolded yet.**  
> There is no `pnpm dev` at the repository root until workspaces and app packages are added.

Planned examples (illustrative only):

```bash
pnpm dev
pnpm --filter web dev
pnpm --filter api start:dev
pnpm --filter mobile start
```

Exact script names will match `package.json` / Turborepo (or chosen) task definitions when implementation lands.

---

## 8. Branch strategy

| Branch / pattern | Role |
|------------------|------|
| **`main`** | Production-aligned, protected, release-ready history. |
| **`development`** | Integration branch for ongoing platform work; default for day-to-day merges after review. |
| **`feature/*`** | Short-lived branches for features or fixes (e.g. `feature/auth-middleware`). |
| **`platform/*`** | Larger cross-cutting initiatives (tooling, governance, migrations) when a single feature name is too narrow. |

### Merge philosophy

- **Small, reviewable PRs** with clear intent and linked context (issue or doc section).
- **Rebase or merge** per team convention; keep `development` shippable.
- **No direct pushes** to `main` without release discipline and required checks (when CI exists).

---

## 9. Coding standards

Before writing production code, align with:

| Document | Focus |
|----------|--------|
| [`coding-standards.md`](coding-standards.md) | TypeScript, testing, PR hygiene, and repository conventions. |
| [`../ai/auryn-ai-master-rules.md`](../ai/auryn-ai-master-rules.md) | AI behavior, safety, and implementation guardrails. |
| [`../internal/validation-commands.md`](../internal/validation-commands.md) | **Optional** deep checklist for agents / pre-implementation (not required for basic contributor onboarding — see root [`SETUP.md`](../../SETUP.md)). |

Also read [`design-system.md`](design-system.md) for UI tokens and components, and **[`AGENTS.md`](../../AGENTS.md)** for agent + engineer guardrails that apply across the stack.

If a linked file is missing in your clone, it may not have been added yet — ask the tech lead or open a docs PR to restore the link target.

---

## 10. Current project status

### Current phase

- **Architecture preparation** and repository organization  
- **Platform governance** (AGENTS, docs structure, engineering norms)  
- **Foundation planning** (folder boundaries, Prisma home, infrastructure placeholders)

### Not yet implemented

- **Product features** in runnable code  
- **AI workflows** (beyond documentation and planning)  
- **Orchestration systems** in production form  
- **Recovery logic** as shipped product behavior  
- **Vector memory** and full memory / retrieval pipelines  
- **Frontend experiences** — Next.js and Expo **not** initialized under `apps/` (directory layout only)

**What you can do today:** read product and architecture docs, set up Git + Node + pnpm, copy `.env.example` to `.env`, and follow [`local-development.md`](local-development.md) so you are ready the day the workspace is initialized.

---

## Summary

Auryn is an **architecture-driven, AI-native** platform. This repository is intentionally **onboarding-first**: structure and docs first, implementation second. When scaffolding arrives, this guide’s “future” sections become the live runbook — update them in the same PR that adds tooling.
