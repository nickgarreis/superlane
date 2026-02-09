# P2.2 Testing + CI Gates

## Summary
Implemented P2.2 by adding a required CI workflow, expanding frontend behavior tests for auth/protected routing, and adding backend gap tests for comment reactions and pending-upload discard flows.

## What Changed

### CI + Gate Contract
- Added GitHub Actions workflow: `/Users/nick/Designagency/.github/workflows/ci.yml`
  - Trigger: `pull_request`
  - Node version: `20`
  - Parallel jobs: `lint`, `typecheck`, `build`, `test`, `security`
  - Aggregate required job: `ci-required`
  - Artifacts:
    - `security-reports/vitest-report.json`
    - `security-reports/dependency-audit-report.json`

### NPM Scripts + Test Tooling
- Updated `/Users/nick/Designagency/package.json`:
  - Added `test` (`vitest run`)
  - Added `test:backend`
  - Added `test:frontend`
- Added frontend testing dev dependencies:
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - `@testing-library/user-event`
  - `jsdom`
- Updated `/Users/nick/Designagency/vitest.config.ts`:
  - Expanded include to `src/app/**/*.test.{ts,tsx}`
  - Added setup file `./src/app/test/setup.ts`
- Added setup file: `/Users/nick/Designagency/src/app/test/setup.ts`

### Frontend Behavior Coverage
- Added `/Users/nick/Designagency/src/app/components/auth_routing.test.tsx`
  - Protected route unauth redirect includes encoded `returnTo`
  - Protected route authenticated render succeeds
  - Protected route loading state coverage
  - Return-to sanitization safety checks
  - Auth callback safe redirect behavior (missing code, fallback paths)
- Minimal testability refactor:
  - Extracted `ProtectedRoute` to `/Users/nick/Designagency/src/app/components/ProtectedRoute.tsx`
  - Updated `/Users/nick/Designagency/src/app/App.tsx` to import/use extracted component
  - Exported helper functions for direct sanitization tests:
    - `ensureSafeReturnTo` in `/Users/nick/Designagency/src/app/components/AuthPage.tsx`
    - `sanitizeReturnTo` in `/Users/nick/Designagency/src/app/components/AuthCallbackPage.tsx`

### Backend Critical Gap Coverage
- Added `/Users/nick/Designagency/convex/__tests__/comments_and_pending_uploads.test.ts`
  - `comments.toggleReaction` add/remove semantics
  - Multi-user reaction attribution via `comments.listForProject`
  - Unauthorized reaction toggle rejection
  - `files.discardPendingUploadsForSession` uploader-scoped deletion
  - Session discard idempotency (`removedCount` goes to `0` on repeat)
  - Unauthorized session discard rejection

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
- `npm test` ✅
- `npm run security:check` ✅

## Required Check + Branch Protection Dependency
- Required CI status check name: `ci-required`
- Branch protection for `main` must require PR merges and require passing `ci-required` to enforce “all merge paths gated.”
