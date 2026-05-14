#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
#  Auryn — Automated Setup Verification
#
#  Usage:  pnpm verify          (wired in root package.json)
#          bash scripts/verify.sh
#
#  Runs 10 sequential checks that validate the monorepo setup
#  documented in UITest.md. Designed for fresh installs, CI gates,
#  and onboarding validation.
#
#  Exit code: 0 = all passed, 1 = at least one failure.
# ──────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Formatting ───────────────────────────────────────────────────

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
RESULTS=()

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  RESULTS+=("${GREEN}[PASS]${RESET} $1")
  echo -e "  ${GREEN}✓${RESET} $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  RESULTS+=("${RED}[FAIL]${RESET} $1")
  echo -e "  ${RED}✗${RESET} $1"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  RESULTS+=("${YELLOW}[WARN]${RESET} $1")
  echo -e "  ${YELLOW}!${RESET} $1"
}

section() {
  echo ""
  echo -e "${CYAN}${BOLD}── $1 ──${RESET}"
}

# ── Resolve repo root ───────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║          Auryn — Setup Verification                     ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Repository: ${ROOT_DIR}"
echo -e "  Node:       $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo -e "  pnpm:       $(pnpm --version 2>/dev/null || echo 'NOT FOUND')"
echo -e "  Time:       $(date '+%Y-%m-%d %H:%M:%S')"

# ══════════════════════════════════════════════════════════════════
#  1. Workspace Installation
# ══════════════════════════════════════════════════════════════════

section "1/10  Workspace Installation"

if [ -d "node_modules" ]; then
  pass "Root node_modules exists"
else
  fail "Root node_modules missing — run 'pnpm install'"
fi

if [ -f "pnpm-workspace.yaml" ]; then
  pass "pnpm-workspace.yaml present"
else
  fail "pnpm-workspace.yaml missing"
fi

if [ -f "pnpm-lock.yaml" ]; then
  pass "pnpm-lock.yaml present"
else
  fail "pnpm-lock.yaml missing — run 'pnpm install'"
fi

for pkg in packages/config packages/types packages/utils; do
  if [ -d "$pkg" ] && [ -f "$pkg/package.json" ]; then
    pass "Shared package $pkg exists"
  else
    fail "Shared package $pkg missing"
  fi
done

for app in apps/web apps/api apps/mobile; do
  if [ -d "$app/node_modules" ] || [ -d "node_modules" ]; then
    pass "$app dependencies linked"
  else
    fail "$app dependencies not installed"
  fi
done

# ══════════════════════════════════════════════════════════════════
#  2. Environment Validation
# ══════════════════════════════════════════════════════════════════

section "2/10  Environment Validation"

if [ -f ".env.example" ]; then
  pass ".env.example exists"
else
  fail ".env.example missing — template for environment variables"
fi

if [ -f ".env" ]; then
  pass ".env file exists"

  # Check critical variables
  if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    pass "DATABASE_URL is set in .env"
  else
    warn "DATABASE_URL missing in .env — API database features unavailable"
  fi

  if grep -q "^API_JWT_SECRET=.\+" .env 2>/dev/null; then
    pass "API_JWT_SECRET is set in .env"
  else
    warn "API_JWT_SECRET empty or missing — set any random string for development"
  fi

  if grep -qE "^(NEXT_PUBLIC_OPENAI_|EXPO_PUBLIC_OPENAI_)" .env 2>/dev/null; then
    fail "Client-exposed OpenAI variables detected — secrets must be server-only"
  else
    pass "No client-exposed OpenAI variables"
  fi
else
  warn ".env file missing — run: cp .env.example .env"
fi

# ══════════════════════════════════════════════════════════════════
#  3. ESLint Validation
# ══════════════════════════════════════════════════════════════════

section "3/10  ESLint Validation"

echo -e "  Running ${BOLD}pnpm lint${RESET} ..."

if pnpm lint > /tmp/auryn-lint.log 2>&1; then
  pass "ESLint passes across all workspaces"
else
  fail "ESLint reported errors — check output below"
  # Show last 20 lines of lint output for quick diagnostics
  echo ""
  tail -20 /tmp/auryn-lint.log | while IFS= read -r line; do
    echo "    $line"
  done
  echo ""
fi

# ══════════════════════════════════════════════════════════════════
#  4. TypeScript Validation
# ══════════════════════════════════════════════════════════════════

section "4/10  TypeScript Validation"

if [ -f "tsconfig.json" ]; then
  pass "Root tsconfig.json exists"
else
  fail "Root tsconfig.json missing"
fi

for loc in apps/web/tsconfig.json apps/api/tsconfig.json apps/mobile/tsconfig.json \
           packages/config/tsconfig.json packages/types/tsconfig.json packages/utils/tsconfig.json; do
  if [ -f "$loc" ]; then
    pass "$loc present"
  else
    fail "$loc missing"
  fi
done

echo -e "  Running ${BOLD}pnpm typecheck${RESET} ..."

if pnpm typecheck > /tmp/auryn-typecheck.log 2>&1; then
  pass "TypeScript type-check passes"
else
  fail "TypeScript type-check failed — check output below"
  echo ""
  tail -20 /tmp/auryn-typecheck.log | while IFS= read -r line; do
    echo "    $line"
  done
  echo ""
fi

# ══════════════════════════════════════════════════════════════════
#  5. Turborepo Build
# ══════════════════════════════════════════════════════════════════

section "5/10  Turborepo Build"

if [ -f "turbo.json" ]; then
  pass "turbo.json configuration exists"
else
  fail "turbo.json missing"
fi

echo -e "  Running ${BOLD}pnpm build${RESET} ..."

if pnpm build > /tmp/auryn-build.log 2>&1; then
  pass "Full workspace build succeeded"
else
  fail "Workspace build failed — check output below"
  echo ""
  tail -30 /tmp/auryn-build.log | while IFS= read -r line; do
    echo "    $line"
  done
  echo ""
fi

# ══════════════════════════════════════════════════════════════════
#  6. Web Application Validation
# ══════════════════════════════════════════════════════════════════

section "6/10  Web Application (Next.js)"

if [ -f "apps/web/next.config.ts" ] || [ -f "apps/web/next.config.mjs" ] || [ -f "apps/web/next.config.js" ]; then
  pass "Next.js config file exists"
else
  fail "Next.js config file missing in apps/web/"
fi

if [ -d "apps/web/src/app" ]; then
  pass "App Router directory (src/app) exists"
else
  fail "App Router directory missing"
fi

if [ -f "apps/web/postcss.config.mjs" ] || [ -f "apps/web/postcss.config.js" ] || \
   grep -q "tailwindcss" apps/web/package.json 2>/dev/null; then
  pass "Tailwind CSS configured"
else
  warn "Tailwind CSS configuration not detected"
fi

if [ -f "apps/web/vercel.json" ]; then
  if python3 -c "import json; json.load(open('apps/web/vercel.json'))" 2>/dev/null; then
    pass "vercel.json is valid JSON"
  else
    fail "vercel.json is not valid JSON"
  fi
else
  warn "vercel.json not found — Vercel deployment may need configuration"
fi

if [ -d "apps/web/.next" ]; then
  pass "Next.js build output (.next/) exists"
else
  warn "Next.js build output (.next/) not found — run 'pnpm build' first"
fi

# ══════════════════════════════════════════════════════════════════
#  7. Backend Validation (NestJS)
# ══════════════════════════════════════════════════════════════════

section "7/10  Backend Application (NestJS)"

if [ -f "apps/api/nest-cli.json" ]; then
  pass "nest-cli.json exists"
else
  fail "nest-cli.json missing in apps/api/"
fi

if [ -d "apps/api/src/modules" ]; then
  MODULE_COUNT=$(find apps/api/src/modules -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
  pass "Module directory exists (${MODULE_COUNT} modules found)"
else
  fail "Module directory missing"
fi

if [ -f "apps/api/prisma/schema.prisma" ]; then
  pass "Prisma schema exists"
else
  fail "Prisma schema missing"
fi

if [ -d "apps/api/dist" ]; then
  pass "NestJS build output (dist/) exists"
else
  warn "NestJS build output (dist/) not found — run 'pnpm build:api' first"
fi

if [ -f "apps/api/Dockerfile" ]; then
  pass "Dockerfile exists for API"
else
  warn "Dockerfile missing — Railway deployment requires it"
fi

if [ -f "apps/api/railway.toml" ]; then
  pass "railway.toml exists"
  if grep -q "healthcheckPath" apps/api/railway.toml 2>/dev/null; then
    pass "Health check path configured in railway.toml"
  else
    warn "healthcheckPath not set in railway.toml"
  fi
else
  warn "railway.toml not found"
fi

# ══════════════════════════════════════════════════════════════════
#  8. Mobile Application Validation (Expo)
# ══════════════════════════════════════════════════════════════════

section "8/10  Mobile Application (Expo)"

if [ -f "apps/mobile/app.json" ]; then
  pass "Expo app.json exists"
else
  fail "Expo app.json missing"
fi

if [ -d "apps/mobile/src/app" ] || [ -d "apps/mobile/app" ]; then
  pass "Expo Router directory exists"
else
  fail "Expo Router directory missing"
fi

if grep -q "expo-router" apps/mobile/package.json 2>/dev/null; then
  pass "expo-router dependency present"
else
  fail "expo-router dependency missing"
fi

if grep -q "@auryn/types" apps/mobile/package.json 2>/dev/null && \
   grep -q "@auryn/utils" apps/mobile/package.json 2>/dev/null; then
  pass "Shared workspace packages referenced"
else
  warn "Shared workspace packages not referenced in mobile package.json"
fi

# ══════════════════════════════════════════════════════════════════
#  9. Git Hook Validation
# ══════════════════════════════════════════════════════════════════

section "9/10  Git Hooks"

if [ -d ".husky" ]; then
  pass "Husky directory exists"
else
  fail "Husky directory missing — run 'pnpm prepare'"
fi

if [ -f ".husky/pre-commit" ]; then
  if [ -x ".husky/pre-commit" ] || grep -q "lint-staged" .husky/pre-commit 2>/dev/null; then
    pass "pre-commit hook configured (lint-staged)"
  else
    warn "pre-commit hook exists but may not run lint-staged"
  fi
else
  fail "pre-commit hook missing"
fi

if [ -f ".husky/commit-msg" ]; then
  pass "commit-msg hook exists"
else
  warn "commit-msg hook missing"
fi

if grep -q "lint-staged" package.json 2>/dev/null; then
  pass "lint-staged configured in package.json"
else
  fail "lint-staged configuration missing"
fi

# ══════════════════════════════════════════════════════════════════
# 10. Deployment Config Validation
# ══════════════════════════════════════════════════════════════════

section "10/10  Deployment Configuration"

DEPLOY_CHECKS=0

if [ -f "apps/web/vercel.json" ]; then
  DEPLOY_CHECKS=$((DEPLOY_CHECKS + 1))
  pass "Vercel config (apps/web/vercel.json)"
fi

if [ -f "apps/api/railway.toml" ]; then
  DEPLOY_CHECKS=$((DEPLOY_CHECKS + 1))
  pass "Railway config (apps/api/railway.toml)"
fi

if [ -f "apps/api/Dockerfile" ]; then
  DEPLOY_CHECKS=$((DEPLOY_CHECKS + 1))
  pass "Docker config (apps/api/Dockerfile)"

  if grep -q "HEALTHCHECK" apps/api/Dockerfile 2>/dev/null; then
    pass "Dockerfile includes HEALTHCHECK instruction"
  else
    warn "Dockerfile missing HEALTHCHECK instruction"
  fi
fi

if [ "$DEPLOY_CHECKS" -eq 0 ]; then
  warn "No deployment configurations found"
fi

# ══════════════════════════════════════════════════════════════════
#  Summary
# ══════════════════════════════════════════════════════════════════

TOTAL=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))

echo ""
echo -e "${BOLD}══════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  VERIFICATION SUMMARY${RESET}"
echo -e "${BOLD}══════════════════════════════════════════════════════════${RESET}"
echo ""

for r in "${RESULTS[@]}"; do
  echo -e "  $r"
done

echo ""
echo -e "  ──────────────────────────────────────────────────────"
echo -e "  ${GREEN}Passed:${RESET}   ${PASS_COUNT}"
echo -e "  ${RED}Failed:${RESET}   ${FAIL_COUNT}"
echo -e "  ${YELLOW}Warnings:${RESET} ${WARN_COUNT}"
echo -e "  Total:    ${TOTAL}"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo -e "  ${RED}${BOLD}✗ VERIFICATION FAILED${RESET} — fix the ${FAIL_COUNT} failure(s) above."
  echo ""
  echo -e "  ${BOLD}Quick fixes:${RESET}"
  echo "    • Missing dependencies?  →  pnpm install"
  echo "    • Missing .env?          →  cp .env.example .env"
  echo "    • Lint errors?           →  pnpm lint:fix"
  echo "    • Build errors?          →  Check turbo output above"
  echo "    • Missing hooks?         →  pnpm prepare"
  echo ""
  exit 1
elif [ "$WARN_COUNT" -gt 0 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠ VERIFICATION PASSED WITH WARNINGS${RESET}"
  echo -e "  Warnings are non-blocking but should be addressed."
  echo ""
  exit 0
else
  echo -e "  ${GREEN}${BOLD}✓ ALL CHECKS PASSED${RESET}"
  echo ""
  exit 0
fi
