# Compile `@auryn/config` to JS so Node 22 can load it from `node_modules`

Add a build step (`tsc --build`) to the `@auryn/config` shared package and point its `exports.default` entries at compiled `dist/*.js`, so the API container can load the package at runtime under Node 22.

# Why

The API was crashing on Railway with:

```
ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING
```

Node 22 refuses to strip TypeScript types from any file inside `node_modules`. `apps/api/src/config/configs/app.config.ts` imports `@auryn/config/env/urls`, and the package's `exports` map was previously pointing the runtime resolution (`default`) at the raw `.ts` source. The compiled API (`dist/config/configs/app.config.js`) ended up doing `require("@auryn/config/env/urls")`, which Node resolved to `env/urls.ts` — a `.ts` file in `node_modules`. The process exited before the HTTP server started, so Railway's healthcheck always failed after 10 seconds.

`@auryn/utils` and `@auryn/types` were not affected because the API does not import them at runtime.

# What Changed

- `@auryn/config` now compiles its sources to `dist/` via `tsc --build`, mirroring the `@auryn/utils` / `@auryn/types` pattern.
- `exports` map updated to dual-resolve: `types` continues to point at source `.ts` (preserving inline navigation and HMR DX in dev), `default` points at the compiled `dist/*.js` for Node runtime.
- `files` field added so `pnpm pack` / `pnpm deploy` ship the compiled output even though `dist/` is in the root `.gitignore`.
- `tsconfig.json` flipped from `noEmit: true` to `noEmit: false` with `composite`, `declaration`, and `outDir: ./dist`. The `typescript/` directory is explicitly excluded because it only contains shared tsconfig JSON files.
- API `Dockerfile` builds `@auryn/config` alongside `types` and `utils`, and defensively restores the compiled `dist/` into `/deploy/node_modules/@auryn/config/dist` after `pnpm deploy`. This mirrors the existing safety net for the API's own `dist/`.

# Files Modified

- `packages/config/tsconfig.json`
- `packages/config/package.json`
- `apps/api/Dockerfile`

# Architecture Impact

- The shared config package now has a build artefact lifecycle. Any future CI / Docker pipeline that consumes `@auryn/config` at runtime must run `pnpm --filter @auryn/config build` before packaging.
- No source layout changes — `env/`, `limits.ts`, and `typescript/` stay where they were.

# Database Impact

None.

# API Impact

The API previously crashed on boot in production. Once redeployed with the new image, the `/health` endpoint will respond and Railway's healthcheck will pass.

# AI Impact

None.

# Frontend Impact

None at runtime — web and mobile consume `@auryn/config` through their bundlers (Next.js / Metro), which already resolve the source `.ts` via the `types` export and bundle it during build. Dev DX is preserved because `types` still points at source.

# Future Considerations

- Add `@auryn/config` to the Turbo `build` pipeline graph if it is not already, so the build runs automatically before any app that depends on it.
- Consider hoisting all three workspace packages (`config`, `types`, `utils`) into a single consistent `files` + `exports` pattern documented in `docs/architecture/monorepo-architecture.md`.
- Eventually unify on either source-first or dist-first exports across the monorepo to reduce mental overhead.

# Validation

- `pnpm --filter @auryn/config build` → succeeds, emits `dist/env/{env,urls}.{js,d.ts}` and `dist/limits.{js,d.ts}`.
- `node -e 'require("@auryn/config/env/urls")'` → loads the compiled module, exposes `ENV_KEYS`, `SERVICE_PORTS`, `localUrl`, `normalizeUrl`, `resolveUrl`.
- `pnpm --filter @auryn/api typecheck` → green.
- `pnpm --filter @auryn/api build` → green (`nest build`).
- `pnpm --filter @auryn/web typecheck` → green.
- `pnpm install --frozen-lockfile` → no lockfile churn (no dependency changes).
