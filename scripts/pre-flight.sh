#!/usr/bin/env bash
# ==============================================================================
# SCF Render-Guardian Pre-flight Check
# Mirrors the Render production build environment (render.yaml) exactly.
# Enforces zero-defect delivery: any warning is treated as a hard failure.
#
# Usage: bash scripts/pre-flight.sh
# Exit:  0 = Render Ready | 1 = Build blocked
# ==============================================================================

set -euo pipefail

# ── Color codes ─────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="/tmp/scf-preflight-$(date +%Y%m%d-%H%M%S).log"

# ── Counters ─────────────────────────────────────────────────────────────────
ERRORS=0
WARNINGS_AS_ERRORS=0

# ── Logging helpers ──────────────────────────────────────────────────────────
log()     { echo -e "${BLUE}[SCF]${NC} $*" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}  ✅ PASS${NC}  $*" | tee -a "$LOG_FILE"; }
warn()    {
  echo -e "${YELLOW}  ⚠  WARN${NC}  $*" | tee -a "$LOG_FILE"
  WARNINGS_AS_ERRORS=$((WARNINGS_AS_ERRORS + 1))
}
fail()    {
  echo -e "${RED}  ❌ FAIL${NC}  $*" | tee -a "$LOG_FILE"
  ERRORS=$((ERRORS + 1))
}
fatal()   {
  echo -e "${RED}${BOLD}  ❌ FATAL${NC}${BOLD}  $*${NC}" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
  echo -e "${RED}${BOLD}Pre-flight aborted. Cannot continue.${NC}" | tee -a "$LOG_FILE"
  exit 1
}

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║        SCF Render-Guardian Pre-flight Check v1.0            ║${NC}"
echo -e "${BOLD}${CYAN}║        Simulating Render Production Build Environment       ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "  Log: ${LOG_FILE}"
echo ""

cd "$ROOT_DIR"

# ── Status tracking per package ──────────────────────────────────────────────
SHARED_STATUS="⏳ pending"
SERVER_STATUS="⏳ pending"
WEB_STATUS="⏳ pending"
PRISMA_STATUS="⏳ pending"

# ── Auto-fix: inject composite:true into a tsconfig ─────────────────────────
fix_composite_in_tsconfig() {
  local tsconfig_path="$1"
  if [ ! -f "$tsconfig_path" ]; then
    warn "Cannot auto-fix: $tsconfig_path not found"
    return 1
  fi
  log "  Auto-fix → adding composite:true to $tsconfig_path"
  node -e "
    const fs = require('fs');
    const raw = fs.readFileSync('$tsconfig_path', 'utf8');
    const config = JSON.parse(raw);
    if (!config.compilerOptions) config.compilerOptions = {};
    config.compilerOptions.composite = true;
    if (!config.compilerOptions.declaration) {
      config.compilerOptions.declaration = true;
    }
    fs.writeFileSync('$tsconfig_path', JSON.stringify(config, null, 2) + '\n');
    console.log('    Patched: $tsconfig_path');
  " 2>&1 | tee -a "$LOG_FILE"
}

# ── Auto-fix: scan tsc output for TS6306 and repair all offending tsconfigs ─
fix_ts6306_from_log() {
  local log_content="$1"
  local fixed=0
  # TS6306 format: "Referenced project '/path/to/dir' must have setting..."
  while IFS= read -r line; do
    if echo "$line" | grep -q "TS6306"; then
      # Extract the path between single quotes
      local ref_path
      ref_path=$(echo "$line" | sed -n "s/.*Referenced project '\([^']*\)'.*/\1/p")
      if [ -n "$ref_path" ]; then
        local tsconfig_candidate="$ref_path/tsconfig.json"
        fix_composite_in_tsconfig "$tsconfig_candidate"
        fixed=$((fixed + 1))
      fi
    fi
  done <<< "$log_content"
  echo "$fixed"
}

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 1 — Runtime check
# ═════════════════════════════════════════════════════════════════════════════
log "Step 1/6 → Node.js runtime verification"

if ! command -v node &>/dev/null; then
  fatal "node not found in PATH"
fi

NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\)\..*/\1/')

if [ "$NODE_MAJOR" -ne 22 ]; then
  warn "Node.js $NODE_VERSION detected (Render uses v22.x — build behaviour may differ)"
else
  success "Node.js $NODE_VERSION matches Render production runtime"
fi

if ! command -v pnpm &>/dev/null; then
  fatal "pnpm not found. Install: npm install -g pnpm@9"
fi
PNPM_VERSION=$(pnpm -v)
success "pnpm@$PNPM_VERSION available"

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 2 — Install dependencies (frozen lockfile = strict Render parity)
# ═════════════════════════════════════════════════════════════════════════════
log "Step 2/6 → Installing dependencies (--frozen-lockfile)"

INSTALL_LOG=$(mktemp)
if ! pnpm install --frozen-lockfile 2>&1 | tee "$INSTALL_LOG" | tee -a "$LOG_FILE"; then
  # Retry once without frozen (lockfile might be legitimately ahead)
  log "  --frozen-lockfile failed; retrying without flag..."
  if ! pnpm install 2>&1 | tee -a "$LOG_FILE"; then
    fatal "pnpm install failed. Resolve dependency conflicts first."
  fi
  warn "pnpm-lock.yaml was stale (lockfile not frozen). Commit the updated lockfile."
else
  success "Dependencies installed (lockfile integrity verified)"
fi

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 3 — Build @scf/shared  [MUST succeed before anything else]
# ═════════════════════════════════════════════════════════════════════════════
log "Step 3/6 → Building @scf/shared (contract layer — first in build order)"

SHARED_LOG=$(mktemp)
set +e
pnpm --filter @scf/shared build 2>&1 | tee "$SHARED_LOG" | tee -a "$LOG_FILE"
SHARED_EXIT=${PIPESTATUS[0]}
set -e

if [ $SHARED_EXIT -ne 0 ]; then
  SHARED_CONTENT=$(cat "$SHARED_LOG")

  if echo "$SHARED_CONTENT" | grep -q "TS6306"; then
    log "  TS6306 detected in @scf/shared build. Applying auto-fix..."
    FIXED_COUNT=$(fix_ts6306_from_log "$SHARED_CONTENT")
    log "  Patched $FIXED_COUNT tsconfig(s). Retrying @scf/shared build..."

    set +e
    pnpm --filter @scf/shared build 2>&1 | tee "$SHARED_LOG" | tee -a "$LOG_FILE"
    SHARED_EXIT=${PIPESTATUS[0]}
    set -e

    if [ $SHARED_EXIT -ne 0 ]; then
      SHARED_STATUS="❌ failed (post-fix)"
      fatal "@scf/shared build failed even after auto-fix. Manual intervention required."
    fi
    SHARED_STATUS="✅ pass (auto-fixed)"
    success "@scf/shared compiled successfully after TS6306 auto-fix"
  else
    SHARED_STATUS="❌ failed"
    fatal "@scf/shared build failed. Fix errors before proceeding."
  fi
else
  # Check for warnings in a successful build
  if grep -iE "^warning|: warning" "$SHARED_LOG" | grep -v "experimentalDecorators\|skipLibCheck" > /dev/null 2>&1; then
    SHARED_STATUS="⚠️  warn"
    warn "@scf/shared compiled with warnings (zero-warning policy violated)"
  else
    SHARED_STATUS="✅ pass"
    success "@scf/shared compiled successfully"
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 3b — Prisma generate (MUST run before TypeScript audit/server build)
#             Mirrors render.yaml: "npx prisma generate" before "pnpm build"
# ═════════════════════════════════════════════════════════════════════════════
log "Step 3b/6 → Prisma generate (required before TypeScript audit)"

PRISMA_VERSION=$(node -e "
  try {
    const pkg = require('$ROOT_DIR/apps/server/node_modules/prisma/package.json');
    console.log(pkg.version);
  } catch(e) {
    try {
      const pkg = require('$ROOT_DIR/node_modules/prisma/package.json');
      console.log(pkg.version);
    } catch(e2) { console.log('unknown'); }
  }
" 2>/dev/null || echo "unknown")
log "  Prisma version detected: $PRISMA_VERSION"

# Check for prisma.config.ts (Prisma 7.x feature — may cause container incompatibility)
if [ -f "$ROOT_DIR/apps/server/prisma.config.ts" ]; then
  PRISMA_MAJOR=$(echo "$PRISMA_VERSION" | cut -d. -f1)
  if [ "$PRISMA_MAJOR" -lt 7 ] 2>/dev/null; then
    warn "prisma.config.ts found but Prisma $PRISMA_VERSION (<7.x) may not support it"
    warn "Action required: Remove prisma.config.ts or upgrade Prisma to >=7.x"
  fi
fi

PRISMA_EARLY_LOG=$(mktemp)
set +e
(cd "$ROOT_DIR/apps/server" && npx prisma generate 2>&1) | tee "$PRISMA_EARLY_LOG" | tee -a "$LOG_FILE"
PRISMA_EARLY_EXIT=${PIPESTATUS[0]}
set -e

if [ $PRISMA_EARLY_EXIT -ne 0 ]; then
  PRISMA_EARLY_CONTENT=$(cat "$PRISMA_EARLY_LOG")
  if echo "$PRISMA_EARLY_CONTENT" | grep -qiE "@prisma/config|prisma/config|Cannot find module.*config"; then
    fatal "Prisma config loading error (@prisma/config incompatibility). Fix before continuing."
  else
    fatal "Prisma generate failed. Cannot proceed — server TypeScript compilation requires Prisma types."
  fi
fi
PRISMA_STATUS="✅ pass"
success "Prisma client generated (types now available for TypeScript audit)"

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 4 — TypeScript project references audit  (pnpm -r exec tsc -b)
# ═════════════════════════════════════════════════════════════════════════════
log "Step 4/6 → TypeScript project references audit"

TSC_LOG=$(mktemp)
set +e
pnpm -r exec tsc -b 2>&1 | tee "$TSC_LOG" | tee -a "$LOG_FILE"
TSC_EXIT=${PIPESTATUS[0]}
set -e

if [ $TSC_EXIT -ne 0 ]; then
  TSC_CONTENT=$(cat "$TSC_LOG")
  if echo "$TSC_CONTENT" | grep -q "TS6306"; then
    log "  TS6306 found in workspace audit. Auto-fixing..."
    FIXED_COUNT=$(fix_ts6306_from_log "$TSC_CONTENT")
    log "  Patched $FIXED_COUNT tsconfig(s). Retrying audit..."

    set +e
    pnpm -r exec tsc -b 2>&1 | tee "$TSC_LOG" | tee -a "$LOG_FILE"
    TSC_EXIT=${PIPESTATUS[0]}
    set -e

    if [ $TSC_EXIT -ne 0 ]; then
      fail "TypeScript audit failed after TS6306 auto-fix (other errors remain)"
    else
      success "TypeScript project references: PASS (TS6306 auto-fixed)"
    fi
  else
    fail "TypeScript audit failed — non-TS6306 errors detected"
  fi
else
  success "TypeScript project references: all composite constraints satisfied"
fi

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 5a — Build @scf/server
# ═════════════════════════════════════════════════════════════════════════════
log "Step 5/6 → Building @scf/server"

SERVER_LOG=$(mktemp)
set +e
pnpm --filter @scf/server build 2>&1 | tee "$SERVER_LOG" | tee -a "$LOG_FILE"
SERVER_EXIT=${PIPESTATUS[0]}
set -e

if [ $SERVER_EXIT -ne 0 ]; then
  SERVER_STATUS="❌ failed"
  fail "@scf/server build failed"
else
  if grep -iE "^warning|: warning TS" "$SERVER_LOG" > /dev/null 2>&1; then
    SERVER_STATUS="⚠️  warn"
    warn "@scf/server compiled with TypeScript warnings"
  else
    SERVER_STATUS="✅ pass"
    success "@scf/server compiled successfully"
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 5b — Build @scf/web
# ═════════════════════════════════════════════════════════════════════════════
log "Step 5/6 → Building @scf/web (tsc -b + vite build)"

WEB_LOG=$(mktemp)
set +e
pnpm --filter @scf/web build 2>&1 | tee "$WEB_LOG" | tee -a "$LOG_FILE"
WEB_EXIT=${PIPESTATUS[0]}
set -e

if [ $WEB_EXIT -ne 0 ]; then
  WEB_STATUS="❌ failed"
  fail "@scf/web build failed"
else
  if grep -iE "^warning|: warning TS" "$WEB_LOG" > /dev/null 2>&1; then
    WEB_STATUS="⚠️  warn"
    warn "@scf/web built with warnings"
  else
    WEB_STATUS="✅ pass"
    success "@scf/web compiled and bundled successfully"
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════
#  STEP 6 — Final Prisma client verification (idempotent re-check)
#            Prisma was already generated in step 3b; this confirms the
#            generated client is intact after all builds completed.
# ═════════════════════════════════════════════════════════════════════════════
log "Step 6/6 → Final Prisma client verification"

# Verify that the generated client exists and is readable
PRISMA_CLIENT_PATH="$ROOT_DIR/node_modules/.pnpm/@prisma+client@${PRISMA_VERSION}_prisma@${PRISMA_VERSION}/node_modules/@prisma/client"
if [ -d "$PRISMA_CLIENT_PATH" ] || [ -d "$ROOT_DIR/node_modules/@prisma/client" ]; then
  success "Prisma client ($PRISMA_VERSION) verified in node_modules"
  # PRISMA_STATUS already set to ✅ pass in step 3b
else
  # Fallback: try to find the client anywhere
  FOUND_CLIENT=$(find "$ROOT_DIR/node_modules" -name "index.d.ts" -path "*/@prisma/client/*" 2>/dev/null | head -1)
  if [ -n "$FOUND_CLIENT" ]; then
    success "Prisma client found at: $(dirname "$FOUND_CLIENT")"
  else
    PRISMA_STATUS="⚠️  not found"
    warn "Prisma client declaration files not found in node_modules — prisma generate may have failed silently"
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════
#  AUDIT REPORT
# ═════════════════════════════════════════════════════════════════════════════
echo "" | tee -a "$LOG_FILE"
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}" | tee -a "$LOG_FILE"
echo -e "${BOLD}${CYAN}║              Render Ready Audit Report                      ║${NC}" | tee -a "$LOG_FILE"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo -e "  Runtime :  Node.js $NODE_VERSION | pnpm@$PNPM_VERSION | Prisma $PRISMA_VERSION" | tee -a "$LOG_FILE"
echo -e "  Region  :  singapore (matching render.yaml)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo -e "  Package Build Results:" | tee -a "$LOG_FILE"
echo -e "    @scf/shared   →  $SHARED_STATUS" | tee -a "$LOG_FILE"
echo -e "    @scf/server   →  $SERVER_STATUS" | tee -a "$LOG_FILE"
echo -e "    @scf/web      →  $WEB_STATUS" | tee -a "$LOG_FILE"
echo -e "    Prisma engine →  $PRISMA_STATUS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Artifact sizes (only if builds succeeded)
if [ -d "$ROOT_DIR/apps/server/dist" ] || [ -d "$ROOT_DIR/apps/web/dist" ]; then
  echo -e "  Build Artifacts:" | tee -a "$LOG_FILE"
  [ -d "$ROOT_DIR/apps/server/dist" ] && \
    echo -e "    server/dist   →  $(du -sh "$ROOT_DIR/apps/server/dist" 2>/dev/null | cut -f1)" | tee -a "$LOG_FILE"
  [ -d "$ROOT_DIR/apps/web/dist" ] && \
    echo -e "    web/dist      →  $(du -sh "$ROOT_DIR/apps/web/dist" 2>/dev/null | cut -f1)" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
fi

# Environment variables checklist
echo -e "  Required Environment Variables (verify in Render dashboard):" | tee -a "$LOG_FILE"
echo -e "    DATABASE_URL         — from Render PostgreSQL (auto-injected via Blueprint)" | tee -a "$LOG_FILE"
echo -e "    JWT_SECRET           — auto-generated by Render (generateValue: true)" | tee -a "$LOG_FILE"
echo -e "    JWT_EXPIRES_IN       — 15m" | tee -a "$LOG_FILE"
echo -e "    JWT_REFRESH_EXPIRES_IN — 7d" | tee -a "$LOG_FILE"
echo -e "    CORS_ORIGIN          — https://scf-web.onrender.com" | tee -a "$LOG_FILE"
echo -e "    VITE_API_BASE_URL    — https://scf-api.onrender.com/api" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_ISSUES=$((ERRORS + WARNINGS_AS_ERRORS))

if [ $TOTAL_ISSUES -gt 0 ]; then
  echo -e "${RED}${BOLD}  Result: BLOCKED — $ERRORS error(s), $WARNINGS_AS_ERRORS warning(s) detected${NC}" | tee -a "$LOG_FILE"
  echo -e "${RED}  Git commit and push are prohibited until all issues are resolved.${NC}" | tee -a "$LOG_FILE"
  echo -e "  Full log: $LOG_FILE" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
  exit 1
else
  echo -e "${GREEN}${BOLD}  Result: RENDER READY ✅ — Zero errors, zero warnings${NC}" | tee -a "$LOG_FILE"
  echo -e "${GREEN}  Local build 100% mirrors Render production environment.${NC}" | tee -a "$LOG_FILE"
  echo -e "${GREEN}  You may safely commit and push to remote.${NC}" | tee -a "$LOG_FILE"
  echo -e "  Full log: $LOG_FILE" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
  exit 0
fi
