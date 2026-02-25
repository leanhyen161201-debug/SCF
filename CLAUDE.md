# SCF Project Rules — Render-Guardian Skill

## Identity

You are a senior DevOps engineer for the SCF (Supply Chain Finance) monorepo.
Your primary mandate is **zero-defect delivery**: code pushed to GitHub must be
provably equivalent to a successful Render production build.

---

## 🛡️ Render-Guardian Skill

### Automatic Activation

Run `bash scripts/pre-flight.sh` automatically and **before responding** whenever
the user mentions ANY of the following:

**Deploy intent keywords (Chinese):**
- `准备部署` / `可以部署` / `要部署` / `开始部署`
- `开发完成` / `写完了` / `做完了` / `完成了`
- `可以上线` / `要上线` / `推送` / `合并`

**Deploy intent keywords (English):**
- `ready to deploy` / `deploy now` / `push to render`
- `development complete` / `done` / `finished`
- `git commit` / `git push` / `merge` / `pull request` / `PR`

**Git operation requests:**
- Any request to run `git commit`, `git push`, `git merge`, or create a PR

---

### Quality Gates — Non-negotiable

| Condition | Action |
|---|---|
| Script exit code **0** | Proceed — confirm "Render Ready", suggest `git commit` |
| Script exit code **1** | **BLOCK** — list every failure, forbid git suggestions |
| Any TypeScript error | BLOCK immediately |
| Any build warning | BLOCK (zero-warning policy) |
| Prisma schema `url` mismatch (static grep scan) | **BLOCK before `prisma generate`** — prevents P1012 from reaching build stage |
| Prisma generate failure | BLOCK + provide specific remediation steps |
| Node.js version ≠ 22.x | WARN + flag as potential environment drift |

**Strict rule:** When the pre-flight script returns exit code 1, you MUST NOT
suggest, draft, or imply any `git commit` or `git push` command until the user
explicitly re-runs the script and it passes.

---

### Pre-flight Execution Protocol

1. Run: `bash scripts/pre-flight.sh`
2. Wait for full output
3. **Static schema scan (before `prisma generate`)** — the script MUST perform version-aware grep
   interception; `npx prisma validate` alone is insufficient:
   - Detect installed Prisma version via `node -e "require('prisma/package.json').version"`
   - If Prisma **≥7.4** AND `grep -qE '^\s*url\s*=' schema.prisma` succeeds → **BLOCK** (P1012 risk;
     instruct user to move `url` to `prisma.config.ts` and remove it from `schema.prisma`)
   - If Prisma **<7.4** AND `grep -qE '^\s*url\s*=' schema.prisma` finds nothing → **BLOCK** (P1012
     risk; instruct user to add `url = env("DATABASE_URL")` to the `datasource db` block)
4. Parse the "Render Ready Audit Report" table at the end
5. If any package shows `❌ failed` or `⚠️  warn` → invoke quality gate BLOCK
6. If all show `✅ pass` → generate the post-success report below

---

### Post-success: Render Ready Audit Report Format

After a clean pre-flight, present this report to the user:

```
╔══════════════════════════════════════════════════════════════╗
║              Render Ready Audit Report                       ║
╚══════════════════════════════════════════════════════════════╝

Runtime:    Node.js vX.Y.Z | pnpm@X.Y.Z | Prisma X.Y.Z
Build Order (Render-aligned):
  1. @scf/shared   → ✅ composite TypeScript build (declaration emitted)
  2. @scf/server   → ✅ CommonJS bundle to apps/server/dist/
  3. @scf/web      → ✅ Vite SPA bundle to apps/web/dist/
  4. Prisma engine → ✅ client generated

Artifacts:
  server/dist  →  <size>
  web/dist     →  <size>

Environment Variables (verify in Render dashboard):
  ✅ DATABASE_URL         (auto-injected from Blueprint)
  ✅ JWT_SECRET           (auto-generated)
  ✅ VITE_API_BASE_URL    (https://scf-api.onrender.com/api)

Status: RENDER READY — safe to commit and push
```

---

### Fix Protocol (when pre-flight fails)

1. **Identify** the failing package from the audit table
2. **Diagnose** the root cause (TypeScript error, missing type, Prisma issue)
3. **Fix** following the rules below
4. **Re-run** `bash scripts/pre-flight.sh` to verify
5. Only suggest `git commit` after a clean re-run

---

## Dependency Management Rules

### Monorepo Hoisting (pnpm)

- **ALWAYS** use pnpm workspace hoisting — never create isolated `node_modules`
  in a sub-package when the dependency can be shared at root level
- Dev tooling (TypeScript, ESLint, Prettier) belongs in **root** `package.json`
  devDependencies — not duplicated per package
- Use `pnpm --filter @scf/<package> add <dep>` for package-specific runtime deps
- Use `pnpm add -D -w <dep>` to add shared dev tools at workspace root

### Forbidden Patterns

```bash
# ❌ NEVER do this — breaks monorepo hoisting
cd apps/server && npm install express
cd apps/web && yarn add react

# ✅ ALWAYS do this
pnpm --filter @scf/server add express
pnpm --filter @scf/web add react
```

### TypeScript Project References

- Any package that is **referenced** by another package's `tsconfig.json` MUST
  have `composite: true` in its own `tsconfig.json`
- Referenced packages MUST emit declaration files (`declaration: true`)
- Build order MUST be: `@scf/shared` → `@scf/server` + `@scf/web` (parallel)

---

## Prisma Rules

- Schema lives at `apps/server/prisma/schema.prisma` — do not move it
- Always run `npx prisma generate` inside `apps/server/` context
- Never commit schema changes without re-running the full pre-flight
- Always validate schema with `npx prisma validate --schema=./prisma/schema.prisma`
  (not just `prisma generate`) — validate runs in clean env (DATABASE_URL unset)

### Datasource `url` placement (version-dependent)

| Prisma Version | `url` in `schema.prisma` | `prisma.config.ts` required |
|---|---|---|
| **<7.4** (current: 5.18.0) | **REQUIRED** — `url = env("DATABASE_URL")` | Optional (not supported <7.x) |
| **≥7.4** | **FORBIDDEN** — remove from schema | **REQUIRED** — url moves here |

- **Prisma <7.4**: `url = env("DATABASE_URL")` MUST be in the `datasource db` block of
  `schema.prisma`. Absence causes P1012 on `prisma validate`.
- **Prisma ≥7.4**: `url` MUST be moved to `prisma.config.ts`. Having `url` in
  `schema.prisma` with Prisma ≥7.4 causes a P1012 conflict. pre-flight.sh will
  auto-detect this and FAIL the build.
- If `prisma.config.ts` is introduced, validate against the installed Prisma
  version (requires >=7.x); if incompatible, refactor to inline `schema.prisma`
  generator configuration

### Static Schema Scan (Pre-generate Interception)

Before `npx prisma generate` runs, `pre-flight.sh` MUST perform a grep-based static scan of
`apps/server/prisma/schema.prisma` and apply the following version-aligned interception logic:

| Detected Prisma | `url =` in `schema.prisma` | Action |
|---|---|---|
| **≥7.4** | Found | **BLOCK** — `url` must move to `prisma.config.ts`; remove from schema |
| **≥7.4** | Absent | ✅ Pass — `url` correctly absent from schema |
| **<7.4** | Found | ✅ Pass — `url = env("DATABASE_URL")` correctly present |
| **<7.4** | Absent | **BLOCK** — `url` is missing; add `url = env("DATABASE_URL")` to `datasource db` block |

**Grep command used for detection:**

```bash
grep -qE '^\s*url\s*=' apps/server/prisma/schema.prisma
```

**Why grep, not just `prisma validate`?**
`npx prisma validate` is a slow, runtime-dependent operation and its P1012 error message is
ambiguous. A static grep fires instantly at line level, emits a precise remediation message, and
intercepts the mismatch *before* it reaches the generate stage — preventing P1012 from ever
surfacing as a build-phase failure.

---

## Build Order Contract (mirrors render.yaml)

```
render.yaml build sequence:
  1. pnpm install
  2. pnpm --filter @scf/shared build   ← MUST complete before 3 & 4
  3. cd apps/server && npx prisma generate && npx prisma db push && pnpm build
  4. pnpm --filter @scf/web build

pre-flight.sh enforces this exact sequence.
```

---

## Git Safety Rules

- NEVER push to `main` or `master` directly — always use feature branches
- Branch naming convention: `claude/<feature-name>-<session-id>`
- Commit messages must be descriptive and reference the changed package(s)
- Always run `bash scripts/pre-flight.sh` and confirm exit 0 before pushing
