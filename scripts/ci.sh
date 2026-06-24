#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Windows guard — use ci.ps1 instead
case "$ROOT" in
  /mnt/*)
    echo "ERROR: ci.sh is a Linux/macOS script. On Windows, run: pwsh -NoProfile scripts/ci.ps1" >&2
    exit 1
    ;;
esac

cd "$ROOT"

echo "==> 1/3 skip npm ci"
# npm ci # 本地不准一直跑这个命令

echo "==> 2/3  Smoke test"
npm test

echo "==> 3/4  E2E tests"
npx playwright install chromium --with-deps
npm run test:e2e

echo "==> 4/4  MCP integration tests"
npm run test:skill-mcp

echo "==> All CI checks passed"
