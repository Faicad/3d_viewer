param(
    [string]$OutputDir = (Split-Path $PSScriptRoot -Parent)
)

# Package 3D Viewer skill into two language-specific zip files:
#   3d_viewer_skill_en.zip — English package (SKILL.md + AI_CONTROL_API.md appended)
#   3d_viewer_skill_cn.zip — Chinese package (SKILL_cn.md → SKILL.md + AI_CONTROL_API_cn.md appended)
# Usage: .\package-skill.ps1 [[-OutputDir] <path>]   (default: project root)

$ErrorActionPreference = 'Stop'
$srcDir = (Resolve-Path (Join-Path $PSScriptRoot ".." "skills" "3d_viewer")).Path
$OutputDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputDir)

Add-Type -AssemblyName System.IO.Compression.FileSystem

$excludePatterns = @(
    'env\*',
    'tests\*',
    'test.mjs',
    'playwright.config.ts',
    'tests\smoke-test.mjs',
    'wasm\*',
    'favicon.ico',
    'models\*'
)

$allFiles = Get-ChildItem $srcDir -Recurse -File

function Copy-FileToDir($srcBase, $file, $destDir, $renameMap) {
    $rel = $file.FullName.Substring($srcBase.Length + 1)
    if ($renameMap -and $renameMap.ContainsKey($rel)) {
        $rel = $renameMap[$rel]
    }
    $dest = Join-Path $destDir $rel
    $parent = Split-Path $dest -Parent
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item $file.FullName $dest -Force
}

function Write-ZipFromDir($sourceDir, $outputPath) {
    Write-Host "Packaging files from $sourceDir to $outputPath ..."
    if (Test-Path $outputPath) { Remove-Item $outputPath -Force }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourceDir, $outputPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)
    Write-Host "Done: $outputPath"
}

# --- English package ---
$enTmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $enTmpDir | Out-Null
try {
    foreach ($file in $allFiles) {
        $rel = $file.FullName.Substring($srcDir.Length + 1)
        $excluded = $false
        foreach ($pattern in $excludePatterns) {
            if ($rel -like $pattern) { $excluded = $true; break }
        }
        if ($excluded -or ($rel -eq 'SKILL_cn.md')) { continue }
        Copy-FileToDir $srcDir $file $enTmpDir $null
    }

    $skillPath = Join-Path $enTmpDir "SKILL.md"
    $apiContent = Get-Content (Join-Path $srcDir "docs\AI_CONTROL_API.md") -Raw
    Add-Content -Path $skillPath -Value "`n$apiContent"

    # Inject edition meta for intl
    $enIndex = Join-Path $enTmpDir "index.html"
    if (Test-Path $enIndex) {
        $content = Get-Content $enIndex -Raw
        $content = $content -replace '<head>', '<head>`n  <meta name="edition" content="intl">'
        Set-Content $enIndex $content -NoNewline
    }

    New-Item -ItemType Directory -Path (Join-Path $enTmpDir "models") -Force | Out-Null
    $enOutput = Join-Path $OutputDir "3d_viewer_skill_en.zip"
    Write-ZipFromDir $enTmpDir $enOutput
}
finally {
    Remove-Item -Path $enTmpDir -Recurse -Force -ErrorAction SilentlyContinue
}

# --- Chinese package ---
$cnTmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $cnTmpDir | Out-Null
try {
    foreach ($file in $allFiles) {
        $rel = $file.FullName.Substring($srcDir.Length + 1)
        $excluded = $false
        foreach ($pattern in $excludePatterns) {
            if ($rel -like $pattern) { $excluded = $true; break }
        }
        if ($excluded -or ($rel -eq 'SKILL.md') -or ($rel -eq 'SKILL_cn.md')) { continue }
        Copy-FileToDir $srcDir $file $cnTmpDir $null
    }

    Copy-Item (Join-Path $srcDir "SKILL.md") (Join-Path $cnTmpDir "SKILL_en.md")

    $cnSkillPath = Join-Path $cnTmpDir "SKILL.md"
    Copy-Item (Join-Path $srcDir "SKILL_cn.md") $cnSkillPath
    $cnApiContent = Get-Content (Join-Path $srcDir "docs\AI_CONTROL_API_cn.md") -Raw
    Add-Content -Path $cnSkillPath -Value "`n$cnApiContent"

    # Inject edition meta for cn
    $cnIndex = Join-Path $cnTmpDir "index.html"
    if (Test-Path $cnIndex) {
        $content = Get-Content $cnIndex -Raw
        $content = $content -replace '<head>', '<head>`n  <meta name="edition" content="cn">'
        Set-Content $cnIndex $content -NoNewline
    }

    New-Item -ItemType Directory -Path (Join-Path $cnTmpDir "models") -Force | Out-Null
    $cnOutput = Join-Path $OutputDir "3d_viewer_skill_cn.zip"
    Write-ZipFromDir $cnTmpDir $cnOutput
}
finally {
    Remove-Item -Path $cnTmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
