# ──────────────────────────────────────────────────────────────────
#  Auryn API — Multi-stage production Dockerfile
#
#  Designed for Railway deployment from a pnpm monorepo.
#  Stages: deps → build → production (self-contained runtime image).
# ──────────────────────────────────────────────────────────────────

# ── Base ──────────────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.1.1 --activate
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./

COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

RUN pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────
FROM deps AS build

# Mark this build as non-interactive so pnpm and npx do not prompt for
# confirmation (no TTY is attached during a Docker build).
ENV CI=true

COPY packages/config/ ./packages/config/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

RUN pnpm --filter @auryn/config build && \
    pnpm --filter @auryn/types build && \
    pnpm --filter @auryn/utils build

COPY apps/api/ ./apps/api/

RUN cd apps/api && \
    pnpm exec prisma generate && \
    pnpm build

# Use `pnpm deploy` to materialise a self-contained, symlink-free copy of
# the API together with its production dependencies. `pnpm prune --prod`
# is unsafe here because pnpm's hard-linked / symlinked `node_modules`
# layout does not survive a stage-to-stage `COPY`, which surfaces as
# "Cannot find module '@nestjs/core'" at runtime in the final image.
#
# Flags:
#   --legacy : pnpm v10+ refuses non-injected workspace deploys unless
#     this flag (or `inject-workspace-packages=true` in `.npmrc`) is set.
#     We keep the workspace uninjected and opt in per-build instead.
#   --prod : drop devDependencies from the deployed tree.
#   --ignore-scripts : skip the root `prepare` hook (which calls husky)
#     while the deploy directory is being assembled.
#
# `pnpm deploy` honours `.gitignore`, which excludes `dist/` and the
# generated Prisma client — we restore both explicitly below.
RUN pnpm --filter=@auryn/api deploy \
    --legacy \
    --prod \
    --ignore-scripts \
    /deploy

# Restore the compiled output (excluded from `pnpm deploy` because it is
# listed in the repo `.gitignore`).
RUN cp -R /app/apps/api/dist /deploy/dist

# Restore the compiled `@auryn/config` output into the deployed workspace
# dep. The package now declares `dist/` in its `files` field, but we also
# overwrite it defensively in case `pnpm deploy` filters it out — without
# the compiled JS, the API crashes at startup with
# `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` (Node 22 refuses to strip
# types from `.ts` files inside `node_modules`).
RUN rm -rf /deploy/node_modules/@auryn/config/dist && \
    cp -R /app/packages/config/dist /deploy/node_modules/@auryn/config/dist

# Regenerate the Prisma client inside the deploy directory. `pnpm deploy`
# performs a fresh production install, so the `.prisma/client` artefacts
# generated against the build stage's `node_modules` are not present in
# `/deploy`. Use the `prisma` CLI from the build stage (still on disk in
# the build image, even though it is a devDependency) so we do not need
# a network call at this point in the build.
RUN cd /deploy && /app/apps/api/node_modules/.bin/prisma generate

# ── Production ────────────────────────────────────────────────────
FROM base AS production

ENV NODE_ENV=production

# Single self-contained tree from `pnpm deploy` — no further file
# wrangling needed between stages.
COPY --from=build /deploy /app/apps/api

WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${API_PORT:-4000}/health || exit 1

CMD ["node", "dist/main.js"]
