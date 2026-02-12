# Activities unread summary query patch fix

## Problem
- `activities:getUnreadSummary` query threw `TypeError: a.db.patch is not a function`.
- Root cause: fallback helper `resolveWorkspaceActivityEventCount` attempted `ctx.db.patch(...)` even when executed from a query context, where Convex exposes a read-only DB API.

## Changes made
- Updated `/Users/nick/Designagency/convex/activities.ts`:
  - `resolveWorkspaceActivityEventCount` now checks whether `ctx.db.patch` exists before writing.
  - In query context, it now returns the counted value without attempting persistence.
  - In mutation context, it still persists `workspaces.activityEventCount`.

- Added regression test in `/Users/nick/Designagency/convex/__tests__/activities_read_state.test.ts`:
  - New test seeds a legacy-like workspace state with activity events but without inbox state/cached counter.
  - Verifies `getUnreadSummary` returns the correct unread count.
  - Verifies the query does not backfill `activityEventCount` (no write in query path).

## Validation
- `npx vitest run convex/__tests__/activities_read_state.test.ts` ✅
- `npm run typecheck` ✅
