#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

# ci.ps1 — Windows CI for 3d_viewer deployment
# Run from scripts/ci.ps1 (siblings: ci.sh, package-skill.*)
$SCRIPT_DIR = Split-Path -Parent $PSCommandPath
$ROOT = Split-Path -Parent $SCRIPT_DIR
Set-Location $ROOT

Write-Host "==> CI: $((Get-Date).ToString('HH:mm:ss'))"
Write-Host "    Root: $ROOT"
Write-Host ""

# ---- 1/4  Smoke test ----
Write-Host "==> 1/4  Smoke test"
node skills/3d_viewer/tests/smoke-test.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host ""

# ---- 2/4  Package test ----
Write-Host "==> 2/4  Package test"
node tests/test-package.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host ""

# ---- 3/4  E2E tests (Playwright) ----
Write-Host "==> 3/4  E2E tests"
# Check Playwright browsers exist, install if missing
$pwBrowsers = "$env:USERPROFILE\AppData\Local\ms-playwright"
$needsInstall = $true
if (Test-Path $pwBrowsers) {
    $existing = Get-ChildItem $pwBrowsers -Directory | Where-Object { $_.Name -like 'chromium*' }
    if ($existing) { $needsInstall = $false }
}
if ($needsInstall) {
    Write-Host "    Installing Playwright browsers..."
    npx playwright install chromium
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "    Playwright browsers found, skipping install"
}
node skills/3d_viewer/scripts/kill-port.mjs
npx playwright test --config skills/3d_viewer/playwright.config.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host ""

# ---- 4/4  MCP integration tests ----
Write-Host "==> 4/4  MCP integration tests"
node skills/3d_viewer/tests/test-skill-mcp.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host ""

Write-Host "==> All CI checks passed ($((Get-Date).ToString('HH:mm:ss')))"
