#!/usr/bin/env bash
set -euo pipefail

# Package 3D Viewer skill into two language-specific zip files:
#   3d_viewer_skill_en.zip — English package (SKILL.md + AI_CONTROL_API.md appended)
#   3d_viewer_skill_cn.zip — Chinese package (SKILL_cn.md → SKILL.md + AI_CONTROL_API_cn.md appended)
# Usage: ./package-skill.sh [output_dir]   (default: project root)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT/skills/3d_viewer"
OUTPUT_DIR="${1:-$ROOT}"

EXCLUDES=(
  'env/*'
  'tests/*'
  'test.mjs'
  'playwright.config.ts'
  'tests/smoke-test.mjs'
  'wasm/*'
  'favicon.ico'
  'models/*'
)

cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

# --- English package ---
EN_OUTPUT="$OUTPUT_DIR/3d_viewer_skill_en.zip"
TMPDIR="$(mktemp -d)"
echo "Packaging EN to $EN_OUTPUT ..."
rm -f "$EN_OUTPUT"

(cd "$SRC_DIR" && find . -type f | while IFS= read -r rel; do
  rel="${rel#./}"
  for p in "${EXCLUDES[@]}"; do
    case "$rel" in
      $p) continue 2 ;;
    esac
  done
  case "$rel" in
    SKILL_cn.md) continue ;;
  esac
  d="$(dirname "$rel")"
  mkdir -p "$TMPDIR/$d"
  cp "$SRC_DIR/$rel" "$TMPDIR/$rel"
done)

cat "$SRC_DIR/docs/AI_CONTROL_API.md" >> "$TMPDIR/SKILL.md"

# Inject edition meta for intl
if [ -f "$TMPDIR/index.html" ]; then
  sed -i 's|<head>|<head>\n  <meta name="edition" content="intl">|' "$TMPDIR/index.html"
fi

mkdir -p "$TMPDIR/models"
(cd "$TMPDIR" && zip -r "$EN_OUTPUT" .)
echo "Done: $EN_OUTPUT"

# --- Chinese package ---
CN_OUTPUT="$OUTPUT_DIR/3d_viewer_skill_cn.zip"
rm -rf "$TMPDIR"
TMPDIR="$(mktemp -d)"
echo "Packaging CN to $CN_OUTPUT ..."
rm -f "$CN_OUTPUT"

(cd "$SRC_DIR" && find . -type f | while IFS= read -r rel; do
  rel="${rel#./}"
  for p in "${EXCLUDES[@]}"; do
    case "$rel" in
      $p) continue 2 ;;
    esac
  done
  case "$rel" in
    SKILL.md | SKILL_cn.md) continue ;;
  esac
  d="$(dirname "$rel")"
  mkdir -p "$TMPDIR/$d"
  cp "$SRC_DIR/$rel" "$TMPDIR/$rel"
done)

cp "$SRC_DIR/SKILL.md" "$TMPDIR/SKILL_en.md"
cp "$SRC_DIR/SKILL_cn.md" "$TMPDIR/SKILL.md"
cat "$SRC_DIR/docs/AI_CONTROL_API_cn.md" >> "$TMPDIR/SKILL.md"

# Inject edition meta for cn
if [ -f "$TMPDIR/index.html" ]; then
  sed -i 's|<head>|<head>\n  <meta name="edition" content="cn">|' "$TMPDIR/index.html"
fi

mkdir -p "$TMPDIR/models"
(cd "$TMPDIR" && zip -r "$CN_OUTPUT" .)
echo "Done: $CN_OUTPUT"
