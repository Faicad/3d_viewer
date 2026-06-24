#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir, platform } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const IS_WIN = platform() === 'win32'

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  \u2713 ${msg}`) }
  else { failed++; console.log(`  \u2717 ${msg}`) }
}

function runPackage(tmpDir) {
  if (IS_WIN) {
    const script = join(PROJECT_ROOT, 'scripts', 'package-skill.ps1')
    execSync(`pwsh -NoProfile -File "${script}" "${tmpDir}"`, {
      stdio: 'pipe',
      timeout: 30000,
    })
  } else {
    const script = join(PROJECT_ROOT, 'scripts', 'package-skill.sh')
    execSync(`bash "${script}" "${tmpDir}"`, {
      stdio: 'pipe',
      timeout: 30000,
    })
  }
}

function readZipIndex(zipPath) {
  if (IS_WIN) {
    const psCmd = `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
      `$z = [System.IO.Compression.ZipFile]::OpenRead('${zipPath}'); ` +
      `$e = $z.GetEntry('index.html'); ` +
      `$r = New-Object System.IO.StreamReader($e.Open()); ` +
      `$c = $r.ReadToEnd(); $r.Dispose(); $z.Dispose(); Write-Output $c`
    return execSync(`pwsh -NoProfile -Command "${psCmd}"`, { encoding: 'utf-8', timeout: 10000 })
  } else {
    return execSync(`unzip -p "${zipPath}" index.html`, { encoding: 'utf-8', timeout: 5000 })
  }
}

function cleanDir(dir) {
  if (IS_WIN) {
    execSync(`rd /s /q "${dir}"`, { stdio: 'ignore', timeout: 5000 })
  } else {
    execSync(`rm -rf "${dir}"`, { stdio: 'ignore', timeout: 5000 })
  }
}

function testPackage() {
  console.log('--- Package integrity ---')

  const tmpDir = mkdtempSync(join(tmpdir(), 'pkg-test-'))
  try {
    runPackage(tmpDir)

    const enZip = join(tmpDir, '3d_viewer_skill_en.zip')
    const cnZip = join(tmpDir, '3d_viewer_skill_cn.zip')
    assert(existsSync(enZip), 'EN zip created')
    assert(existsSync(cnZip), 'CN zip created')

    const enIndex = readZipIndex(enZip)
    const cnIndex = readZipIndex(cnZip)

    assert(enIndex.includes('name="edition" content="intl"'), 'EN index.html has edition=intl')
    assert(!enIndex.includes('name="edition" content="cn"'), 'EN index.html does not have edition=cn')
    assert(cnIndex.includes('name="edition" content="cn"'), 'CN index.html has edition=cn')
    assert(!cnIndex.includes('name="edition" content="intl"'), 'CN index.html does not have edition=intl')
  } finally {
    cleanDir(tmpDir)
  }
}

function main() {
  console.log('test-package.mjs \u2014 3d_viewer packaging validation')
  testPackage()
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main()
