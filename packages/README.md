# Shared packages (`packages/`)

Each folder is a future **pnpm workspace** package. **No `package.json` yet** — intentional for this foundation phase.

| Package | Role |
| ------- | ---- |
| `design-system` | Semantic tokens, Tailwind preset, wellness UI direction |
| `ui` | Reusable primitives for web/admin |
| `types` | Cross-surface TypeScript contracts |
| `validation` | Shared Zod (or agreed) schemas |
| `ai` | Non-secret AI helpers; orchestration stays in `apps/api` |
| `prompts` | Versioned prompt organization |
| `memory` | Memory / retrieval abstractions |
| `sdk` | Typed client for Auryn HTTP APIs |
| `config` | Shared lint / format / TS configs |
| `utils` | Small pure helpers |

See `docs/architecture/monorepo-architecture.md`.
