# Troubleshooting — local environment

**First:** follow **[`SETUP.md`](../../SETUP.md)**. Confirm Node LTS, `pnpm -v` (when used), and that `.env` exists from `.env.example`.

Foundation phase: many fixes below apply **after** `package.json` and apps exist.

---

## pnpm issues

Install via [pnpm installation](https://pnpm.io/installation) or Corepack. Run installs from the **repository root** unless documented otherwise.

---

## Node version mismatches

Align with **LTS** and root `engines.node` when present. Use nvm, fnm, or asdf.

---

## Workspace issues

After `pnpm-workspace.yaml` exists: run `pnpm install` from root; verify `apps/*` and `packages/*` are listed.

---

## Environment variable issues

Match **names** in `.env.example`; restart dev servers after edits; never commit `.env`.

---

## Prisma / Expo / Tailwind

Expand these sections when `apps/api`, `apps/mobile`, and Tailwind configs land — see **[`SETUP.md`](../../SETUP.md)** for status.

---

## Related

- [`setup-guide.md`](setup-guide.md)  
- [`local-development.md`](local-development.md)
