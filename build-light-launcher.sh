#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/发布版-轻量"
rm -rf "$ROOT/build" "$ROOT/dist" "$OUT"
mkdir -p "$OUT"
pyinstaller --noconfirm "$ROOT/light-launcher.spec"
cp "$ROOT/dist/合规报告访问门户生成器-轻量版" "$OUT/" 2>/dev/null || true
cp "$ROOT/dist/合规报告访问门户生成器-轻量版.exe" "$OUT/" 2>/dev/null || true
cp "$ROOT/README.md" "$OUT/README-轻量版.md"
cp "$ROOT/发布版-轻量/使用说明.txt" "$OUT/使用说明.txt" 2>/dev/null || true
