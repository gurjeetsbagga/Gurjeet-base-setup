# Local development — Auryn

**Start here:** root **[`SETUP.md`](../../SETUP.md)** for prerequisites, clone, env, and branch workflow.

This page is a **short companion** for how we intend to work once the monorepo exists.

---

## Philosophy

- **Thin clients** — web/mobile call documented APIs; orchestration stays server-side.  
- **Secrets only on the server** — never ship provider keys to browsers or app bundles.  
- **One design system** — tokens and primitives from `packages/design-system` / `packages/ui` when implemented.

---

## When tooling exists

1. `git checkout development && git pull`  
2. `pnpm install` at repo root  
3. Run only the apps you need (`pnpm --filter …`)  
4. Follow **[`coding-standards.md`](coding-standards.md)** and **[`branch-strategy.md`](branch-strategy.md)**  
5. Use **[`../internal/validation-commands.md`](../internal/validation-commands.md)** only for **optional** deep pre-implementation checks (agents / complex AI work).

---

## Related

- [`setup-guide.md`](setup-guide.md)  
- [`troubleshooting.md`](troubleshooting.md)  
- [`../../REPOSITORY-STRUCTURE.md`](../../REPOSITORY-STRUCTURE.md)
