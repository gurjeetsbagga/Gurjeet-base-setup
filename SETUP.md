# Setup — Auryn

Practical steps to prepare your machine for the Auryn repository. **Product and architecture background** lives under `docs/`; this file stays short on purpose.

---

## Prerequisites

| Tool | Notes |
|------|--------|
| **Git** | Clone, branches, PRs. |
| **Node.js** | **LTS** (e.g. **22.x**); match root `engines` when `package.json` exists. |
| **pnpm** | Planned monorepo package manager. |
| **Docker** | *Optional* — local Postgres or services later. |
| **PostgreSQL** | *Optional at first* — required when API + Prisma are active. |
| **VS Code or Cursor** | Recommended. |

Install Node + pnpm via your usual toolchain ([nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), [Corepack](https://nodejs.org/api/corepack.html) for pnpm, etc.).

---

## Clone repository

```bash
git clone <repository-url>
cd auryn
```

Use your team’s canonical SSH or HTTPS URL.

---

## Branch workflow

| Name | Use |
|------|-----|
| **`main`** | Release-aligned, protected. |
| **`development`** | Day-to-day integration; create feature branches from here. |
| **`feature/*`** | Short-lived feature or fix branches. |
| **`platform/*`** | Cross-cutting tooling or governance work. |

Typical first sync:

```bash
git checkout development
git pull
```

Full conventions: **[`docs/engineering/branch-strategy.md`](docs/engineering/branch-strategy.md)**.

---

## Install dependencies (future)

> **Not available yet** — there is no root workspace `package.json` / `pnpm-workspace.yaml` during the foundation phase.

When the monorepo is initialized:

```bash
pnpm install
```

---

## Environment variables

```bash
cp .env.example .env
```

Edit **`.env`** locally only. Never commit secrets.

| Area | Examples (names only) |
|------|------------------------|
| Database | `DATABASE_URL` |
| OpenAI | `OPENAI_API_KEY` (server-side only when implemented) |
| Web | `NEXT_PUBLIC_APP_URL` (when Next.js exists) |
| Supabase / AWS | Commented placeholders in `.env.example` — use when integrated |

Details: **[`docs/engineering/setup-guide.md`](docs/engineering/setup-guide.md)** §6.

---

## Run commands (future)

> **Applications are not scaffolded yet.** No `pnpm dev` at the root until workspaces exist.

Planned examples (exact scripts TBD):

```bash
pnpm dev
pnpm --filter web dev
pnpm --filter api start:dev
pnpm --filter mobile start
```

---

## Current project status

The repository is in **architecture setup**, **repository organization**, and **foundation preparation**:

- Folder layout for `apps/`, `packages/`, `prisma/`, `infrastructure/`, and `docs/` is in place.  
- **Apps are not fully scaffolded** — no Next.js / NestJS / Expo install at the time of this writing.  
- **Not in full feature implementation** — no production AI workflows, orchestration runtime, recovery logic, or vector memory pipelines in code yet.

When scaffolding lands, update **this file** in the same PR that adds `pnpm install` and dev scripts.

---

## Where to read next

| Doc | Why |
|-----|-----|
| [`docs/engineering/setup-guide.md`](docs/engineering/setup-guide.md) | Extended orientation, stack tables, status. |
| [`docs/engineering/coding-standards.md`](docs/engineering/coding-standards.md) | TypeScript, security, PR expectations. |
| [`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md) | Folder tree and module intent. |
| [`AGENTS.md`](AGENTS.md) | Agent + engineer guardrails. |
| [`docs/references/INDEX.md`](docs/references/INDEX.md) | Full documentation map. |

**Optional deep reference** (agents / advanced validation): [`docs/internal/README.md`](docs/internal/README.md).
