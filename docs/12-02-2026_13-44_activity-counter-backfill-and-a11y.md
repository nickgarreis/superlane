# Activity counter backfill, inbox read-status query optimization, and accessibility tweaks

## Backend changes
- Updated `/Users/nick/Designagency/convex/activities.ts`:
  - Added `initializeWorkspaceActivityCount` mutation to compute and persist `workspaces.activityEventCount` for a workspace.
  - Added `internalBackfillWorkspaceActivityCounts` internal mutation for periodic backfill of workspaces missing cached counters.
  - Added helper logic so `resolveWorkspaceActivityEventCount` relies on persisted counters in query contexts and only initializes in writable contexts.
  - Replaced per-event N+1 read-receipt checks in `listForWorkspace` with a bulk read-receipt fetch and `Set` lookup.
  - Switched counter resolution to use stored `activityEventCount`, with full table recount retained only in explicit initialization/backfill helpers.

- Updated `/Users/nick/Designagency/convex/crons.ts`:
  - Added hourly cron `backfill-workspace-activity-counts` invoking `internal.activities.internalBackfillWorkspaceActivityCounts`.

- Updated `/Users/nick/Designagency/convex/workspaces.ts`:
  - New workspaces now initialize `activityEventCount: 0` at creation time.

## Frontend changes
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - Added `aria-label="Search inbox"` to the inbox search input.

- Updated `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`:
  - Deduplicated keyword terms for the inbox quick action to `"inbox activity log"`.

## Tests updated
- Updated `/Users/nick/Designagency/convex/__tests__/activities_read_state.test.ts`:
  - Legacy counter test now verifies explicit initialization via `activities.initializeWorkspaceActivityCount` and persisted reuse by `getUnreadSummary`.

## Validation
- `npx vitest run convex/__tests__/activities_read_state.test.ts src/app/components/InboxSidebarPanel.test.tsx src/app/components/SearchPopup.test.tsx` ✅
- `npm run typecheck` ✅
