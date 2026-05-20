#!/bin/sh
# Production startup lifecycle (Railway / Docker):
#   1. Validate database configuration
#   2. Enable Prisma advisory locking (concurrent deploy protection)
#   3. prisma generate
#   4. prisma migrate deploy (with wall-clock timeout)
#   5. prisma migrate status
#   6. node scripts/healthcheck-db.js
#   7. exec node dist/main.js
#
# Policy: docs/engineering/railway-prisma-deployment.md
set -eu

cd "$(dirname "$0")/.." || exit 1

SCHEMA_PATH="prisma/schema.prisma"
PRISMA_BIN="node_modules/.bin/prisma"
HEALTHCHECK_BIN="scripts/healthcheck-db.js"
LOG_PREFIX="[api:db]"
API_LOG_PREFIX="[api]"
MIGRATE_DEPLOY_TIMEOUT_SEC="${MIGRATE_DEPLOY_TIMEOUT_SEC:-300}"
MIGRATE_STATUS_TIMEOUT_SEC="${MIGRATE_STATUS_TIMEOUT_SEC:-120}"
DEPLOYMENT_STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%S)"

# Graceful shutdown during migration phase (replaced by Node handlers after exec).
on_shutdown() {
  printf '%s Shutdown signal received\n' "$API_LOG_PREFIX"
  exit 0
}
trap on_shutdown TERM INT

log_api() {
  printf '%s %s\n' "$API_LOG_PREFIX" "$1"
}

log_deployment_metadata() {
  log_api "Environment: ${RAILWAY_ENVIRONMENT_NAME:-${NODE_ENV:-unknown}}"
  log_api "Git SHA: ${RAILWAY_GIT_COMMIT_SHA:-${GIT_COMMIT_SHA:-unknown}}"
  log_api "Deployment started: ${DEPLOYMENT_STARTED_AT}"
  log_api "NODE_ENV: ${NODE_ENV:-unset}"
  log_api "Node version: $(node -v 2>/dev/null || echo unknown)"
  if [ -n "${RAILWAY_SERVICE_NAME:-}" ]; then
    log_api "Railway service: ${RAILWAY_SERVICE_NAME}"
  fi
  if [ -n "${RAILWAY_DEPLOYMENT_ID:-}" ]; then
    log_api "Railway deployment: ${RAILWAY_DEPLOYMENT_ID}"
  fi
}

log() {
  printf '%s %s\n' "$LOG_PREFIX" "$1"
}

fail() {
  log "ERROR: $1"
  exit 1
}

# Run a command with optional GNU/BusyBox timeout(1). Exit 124 → explicit timeout failure.
run_with_timeout() {
  _limit="$1"
  shift

  if command -v timeout >/dev/null 2>&1; then
    if timeout "$_limit" "$@"; then
      return 0
    fi
    _code=$?
    if [ "$_code" -eq 124 ]; then
      fail "Command timed out after ${_limit}s: $*"
    fi
    return "$_code"
  fi

  log "WARN: timeout(1) not available — running without wall-clock limit: $*"
  "$@"
}

# Protocol + host + database name only (no password, no query string).
redact_url() {
  printf '%s' "$1" | sed -E \
    's#(postgresql|postgres)://[^@/]+@#\1://***@#; s#\\?.*##; s#@[^/]+#@***#'
}

url_contains_forbidden_host() {
  printf '%s' "$1" | grep -qE 'localhost|127\.0\.0\.1|0\.0\.0\.0' 2>/dev/null
}

url_missing_credentials() {
  printf '%s' "$1" | grep -qE '^postgres(ql)?://(@|:|[^:/]+@/)' 2>/dev/null
}

is_public_railway_host() {
  case "$1" in
    *railway.internal*) return 1 ;;
    *proxy.rlwy.net*|*up.railway.app*|*ballast.proxy.rlwy.net*) return 0 ;;
    *) return 1 ;;
  esac
}

validate_database_url() {
  _name="$1"
  _url="$2"

  if [ -z "$_url" ]; then
    fail "$_name is required. Set it on the Railway API service (e.g. \${{Postgres.DATABASE_URL}})."
  fi

  case "$_url" in
    postgres://* | postgresql://*) ;;
    *)
      fail "$_name must be a postgres:// or postgresql:// URL."
      ;;
  esac

  if url_missing_credentials "$_url"; then
    fail "$_name appears to have empty or missing database credentials."
  fi

  if [ "${NODE_ENV:-}" = "production" ]; then
    if url_contains_forbidden_host "$_url"; then
      fail "$_name points at localhost/loopback in NODE_ENV=production. Use Railway PostgreSQL URLs only."
    fi

    if is_public_railway_host "$_url"; then
      case "$_url" in
        *sslmode=* ) ;;
        *)
          fail "$_name uses a public Railway host but has no sslmode= parameter. Append ?sslmode=require"
          ;;
      esac
    fi
  fi
}

# ── 0. Deployment metadata (operators / Railway logs) ───────────────
log_deployment_metadata

# ── 1. Validate production database configuration ───────────────────
log "Validating database configuration..."

validate_database_url "DATABASE_URL" "${DATABASE_URL:-}"

if [ -z "${DATABASE_DIRECT_URL:-}" ]; then
  export DATABASE_DIRECT_URL="$DATABASE_URL"
  log "DATABASE_DIRECT_URL not set — using DATABASE_URL for migrations."
else
  validate_database_url "DATABASE_DIRECT_URL" "$DATABASE_DIRECT_URL"
  log "DATABASE_DIRECT_URL configured for migrations."
fi

log "Datasource (runtime): $(redact_url "$DATABASE_URL")"
log "Datasource (migrate): $(redact_url "$DATABASE_DIRECT_URL")"
log "NODE_ENV=${NODE_ENV:-unset}"

if [ ! -f "$SCHEMA_PATH" ]; then
  fail "Missing $SCHEMA_PATH in container."
fi

if [ ! -x "$PRISMA_BIN" ]; then
  fail "Prisma CLI not found at $PRISMA_BIN. Add prisma to production dependencies (see package.json)."
fi

if [ ! -f "$HEALTHCHECK_BIN" ]; then
  fail "Missing $HEALTHCHECK_BIN."
fi

if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  fail "prisma/migrations is missing or empty. Cannot run migrate deploy."
fi

if [ ! -f "dist/main.js" ]; then
  fail "dist/main.js missing. Build the API before starting the container."
fi

# ── 2. Advisory locking (prevent concurrent migrate deploy races) ───
export PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=0
log "Prisma advisory locking enabled (PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=0)."

# ── 3. Prisma client ─────────────────────────────────────────────────
log "Generating Prisma client..."
if ! "$PRISMA_BIN" generate --schema="$SCHEMA_PATH"; then
  fail "prisma generate failed."
fi

# ── 4. Migrations — production-safe (NEVER db push), with timeout ─────
log "Running Prisma migrations with timeout (${MIGRATE_DEPLOY_TIMEOUT_SEC}s)..."
if ! run_with_timeout "$MIGRATE_DEPLOY_TIMEOUT_SEC" \
  "$PRISMA_BIN" migrate deploy --schema="$SCHEMA_PATH"; then
  fail "prisma migrate deploy failed. Container will NOT start."
fi

log "Migration deploy finished successfully."

# ── 5. Post-migration status (drift / pending detection) ─────────────
log "Validating migration status..."
MIGRATE_STATUS="$(run_with_timeout "$MIGRATE_STATUS_TIMEOUT_SEC" \
  "$PRISMA_BIN" migrate status --schema="$SCHEMA_PATH" 2>&1)" || {
  fail "prisma migrate status failed after deploy."
}

printf '%s\n' "$MIGRATE_STATUS" | sed "s/^/$LOG_PREFIX /"

if printf '%s' "$MIGRATE_STATUS" | grep -qiE 'not yet been applied|following migration'; then
  fail "Pending migrations remain after migrate deploy."
fi

if printf '%s' "$MIGRATE_STATUS" | grep -qiE 'database schema is not in sync|schema drift|drift detected'; then
  fail "Database schema is not in sync with migration history."
fi

# ── 6. Database readiness (connectivity + essential tables) ──────────
log "Running database readiness checks..."
if ! node "$HEALTHCHECK_BIN"; then
  fail "Database readiness checks failed."
fi

# ── 7. Start API only after full validation ───────────────────────────
log "Starting API..."
exec node dist/main.js
