#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/发布版-轻量-node"
STAGE="$ROOT/.caxa-stage"
rm -rf "$ROOT/.caxa" "$STAGE" "$OUT"
mkdir -p "$OUT" "$STAGE"
cp "$ROOT/light-launcher-node.js" "$STAGE/"
cp "$ROOT/electron/app/合规报告访问门户生成器.html" "$STAGE/"
cp -R "$ROOT/electron/app/libs" "$STAGE/libs"
cp -R "$ROOT/electron/app/fonts" "$STAGE/fonts"
npx --yes @chainsafe/caxa \
  --input "$STAGE" \
  --output "$OUT/合规报告访问门户生成器-轻量版.exe" \
  -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/light-launcher-node.js"
cp "$ROOT/发布版/使用说明.txt" "$OUT/使用说明.txt"
rm -rf "$STAGE"
