#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-/Users/shivmohan/Documents/workspace/archistra}"

mkdir -p "$TARGET_DIR"

cp "$SOURCE_DIR/index.html" "$TARGET_DIR/index.html"
cp "$SOURCE_DIR/README.md" "$TARGET_DIR/README.md"

echo "Saved generated files to: $TARGET_DIR"
