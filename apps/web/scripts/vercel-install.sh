#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" || ! -f "${ROOT}/pnpm-lock.yaml" ]]; then
  if [[ -f "../../pnpm-lock.yaml" ]]; then
    ROOT="$(cd ../.. && pwd)"
  fi
fi
if [[ -z "${ROOT}" || ! -f "${ROOT}/pnpm-lock.yaml" ]]; then
  echo "ERROR: pnpm-lock.yaml not found at monorepo root."
  echo "Fix in Vercel → Project Settings → General:"
  echo "  1. Root Directory: apps/web"
  echo "  2. Enable: Include source files outside of the Root Directory in the Build Step"
  echo "  3. Install Command: bash scripts/vercel-install.sh (or clear override to use vercel.json)"
  exit 1
fi

cd "${ROOT}"
pnpm install --frozen-lockfile
