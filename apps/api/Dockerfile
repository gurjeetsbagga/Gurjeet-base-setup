# ──────────────────────────────────────────────────────────────────
#  Auryn API — Multi-stage production Dockerfile
#
#  Designed for Railway deployment from a pnpm monorepo.
#  Stages: deps → build → production (pruned runtime image).
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

# pnpm v9+ asks for interactive confirmation before purging node_modules
# during `prune`; CI=true tells it (and other tools) we are non-interactive.
ENV CI=true

COPY packages/config/ ./packages/config/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

RUN pnpm --filter @auryn/types build && \
    pnpm --filter @auryn/utils build

COPY apps/api/ ./apps/api/

RUN cd apps/api && \
    npx prisma generate && \
    pnpm build

# Prune devDependencies in place — keeps generated Prisma client
# intact since @prisma/client is a production dependency.
RUN pnpm prune --prod --config.confirm-modules-purge=false

# ── Production ────────────────────────────────────────────────────
FROM base AS production

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/.npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/packages/types/package.json ./packages/types/
COPY --from=build /app/packages/utils/dist ./packages/utils/dist
COPY --from=build /app/packages/utils/package.json ./packages/utils/
COPY --from=build /app/packages/config ./packages/config

WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${API_PORT:-4000}/health || exit 1

CMD ["node", "dist/main.js"]
