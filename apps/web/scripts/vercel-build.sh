#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  if [[ -f "../../pnpm-lock.yaml" ]]; then
    ROOT="$(cd ../.. && pwd)"
  fi
fi
if [[ -z "${ROOT}" ]]; then
  echo "ERROR: Could not resolve monorepo root (git or ../../pnpm-lock.yaml)."
  exit 1
fi

cd "${ROOT}"
pnpm exec turbo run build --filter=@auryn/web
