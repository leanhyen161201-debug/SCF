#!/usr/bin/env bash
# Install SCF Render-Guardian git hooks for local development enforcement.
# Run once after cloning: bash scripts/install-hooks.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_SRC="$REPO_ROOT/scripts/hooks"
HOOKS_DEST="$REPO_ROOT/.git/hooks"

echo "Installing SCF git hooks..."

cp "$HOOKS_SRC/pre-commit" "$HOOKS_DEST/pre-commit"
chmod +x "$HOOKS_DEST/pre-commit"

echo "✅ SCF git hooks installed."
echo "   pre-commit → runs scripts/pre-flight.sh before every commit"
echo ""
echo "To bypass in an emergency: git commit --no-verify"
