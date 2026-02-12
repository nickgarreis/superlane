# Convex log error cleanup (APP_ORIGIN legacy + activity backfill pagination)

## Date
- 12-02-2026 15:14

## Goal
Resolve the runtime/build errors seen in Convex logs:
- password reset flow still referencing removed `APP_ORIGIN`
- activity count backfill crashing with "multiple paginated queries" in one mutation

## What changed
- Confirmed backend password-reset env contract is now `SITE_URL` (no runtime `APP_ORIGIN` dependency):
  - `/Users/nick/Designagency/convex/lib/env.ts`
  - `/Users/nick/Designagency/convex/auth.ts`
  - `/Users/nick/Designagency/convex/__tests__/auth_password_reset.test.ts`

- Fixed activity backfill/counting logic to comply with Convex pagination constraints:
  - Updated `/Users/nick/Designagency/convex/activities.ts`
    - replaced paginated loop counting in `recountWorkspaceActivityEvents` with a single indexed `.collect()` + `.length`
    - replaced paginated workspace scanning in `findWorkspaceIdsMissingActivityCount` with one `.collect()` and in-memory filtering/slicing
    - tightened return typing in `findWorkspaceIdsMissingActivityCount` so `ctx.db.get(workspaceId)` resolves to `workspaces` docs in typecheck

- Added regression coverage for the reported backfill failure mode:
  - Updated `/Users/nick/Designagency/convex/__tests__/activities_read_state.test.ts`
    - new test seeds 300 legacy `workspaceActivityEvents`
    - runs `internal.activities.internalBackfillWorkspaceActivityCounts`
    - asserts `activityEventCount` is initialized to 300 without mutation failure

## Validation
- `rg -n "APP_ORIGIN|getAppOriginEnv" convex src scripts config -S` (no matches) ✅
- `npx vitest run convex/__tests__/activities_read_state.test.ts convex/__tests__/auth_password_reset.test.ts` ✅
- `npm run typecheck:backend` ✅
