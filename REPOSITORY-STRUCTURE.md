# Repository structure (foundation)

This tree is **folder-level only** — no frameworks installed, no application code scaffolded yet. It exists to align engineering, leadership, and future implementation with the Auryn architecture docs.

```text
auryn/
├── apps/
│   ├── web/          # Planned: Next.js (see docs/architecture/frontend-architecture.md)
│   ├── mobile/       # Planned: Expo + React Native (see mobile-architecture.md)
│   ├── api/          # Planned: NestJS — see apps/api/src/ module boundaries
│   └── admin/        # Planned: internal admin UI
├── packages/
│   ├── design-system/# Tokens, Tailwind preset, semantic colors
│   ├── ui/           # Shared primitives (web/admin; RN consumes tokens separately)
│   ├── types/        # Shared DTOs / TS contracts
│   ├── validation/   # Zod (or agreed) schemas shared api/web/mobile
│   ├── ai/           # Provider-agnostic AI helpers (no secrets in shared paths)
│   ├── prompts/      # Prompt template organization
│   ├── memory/       # Memory abstractions (retrieval interfaces)
│   ├── sdk/          # Typed HTTP client for Auryn API
│   ├── config/       # ESLint, Prettier, TSConfig presets (when added)
│   └── utils/        # Pure utilities
├── infrastructure/   # IaC / hosting notes (placeholders only)
├── docs/             # Internal, engineering
├── prisma/           # Database schema home (PostgreSQL; models added later)
├── AGENTS.md         # Agent + engineer guardrails
└── README.md
```

**`apps/api/src/`** (future NestJS layout — directories only):

- `modules/` — `ai`, `auth`, `users`, `memory`, `conversations`, `recovery`, `physicianos` (integration boundary), `orchestration`, `admin`, `recommendations`  
- `common/`, `config/`, `integrations/`, `prisma/` (app-level Prisma module), `shared/`

**PhysicianOS:** integration only via `physicianos/` + `integrations/` 

**Next step:** implementation phase (workspace tooling, frameworks, schemas) — **not** part of this foundation-only task.
