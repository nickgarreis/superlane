# Deployment Runbook

## Scope

Deploy frontend (Vite app) and backend (Convex functions) with verification checks.

## Prerequisites

- Node.js 20.x
- Repo access + production branch access
- Convex production deployment configured
- Hosting provider access (Vercel)
- Required env vars configured (see `docs/operations/environment-matrix.md`)

## Pre-Deploy Checklist

1. Ensure working tree is clean:
   - `git status --short`
2. Install dependencies:
   - `npm ci`
3. Run required quality gates locally:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
   - `npm run security:check`
   - `npm run perf:check`

Expected result:
- All commands exit with code `0`.
- `npm run perf:check` writes `performance-reports/performance-budget-report.json`.

If any command fails:
- Stop deployment.
- Fix or revert the offending change.
- Re-run full checklist.

## Backend Deploy (Convex)

1. Deploy backend functions/schema:
   - `npm run convex:deploy`

Expected output includes successful deploy confirmation from Convex CLI.

If deploy fails:
- Check missing env vars in Convex dashboard.
- Run `npm run typecheck` again.
- Re-run deploy after fixing.

## Frontend Deploy (Vercel)

1. Build artifact verification:
   - `npm run build`
2. Deploy production frontend:
   - `npx vercel --prod`

Expected output includes deployment URL and `Ready` status.

If deploy fails:
- Inspect Vercel build logs.
- Confirm frontend env vars in project settings.
- Retry after fix.

## Post-Deploy Verification

1. Auth flow:
   - Visit `/login`, `/signup`, `/auth/callback` flow completes.
2. Protected routing:
   - Unauthenticated `/tasks` redirects to login.
   - Authenticated `/tasks` loads dashboard.
3. Core app checks:
   - Open Search (`Cmd/Ctrl+K`).
   - Open Create Project popup.
   - Open Settings popup.
   - Open project chat sidebar.
4. File operations:
   - Upload file, download file, remove file.

Expected result:
- No blocking errors in browser console.
- No failing Convex function calls.

## Deployment Record

Create a dated docs entry in `docs/` with:
- commit SHA
- operator
- deploy time
- pass/fail summary
- rollback reference (if used)
