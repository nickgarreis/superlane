# projectDeletedAt Backfill Run (Dev + Prod Check)

## Date
11-02-2026 09:56

## Scope
Executed `performanceBackfills.backfillWorkspaceDenormalizedFields` to populate denormalized `projectDeletedAt` fields for existing task/file rows.

## Environment discovery
- Dev deployment: contains active workspaces.
- Production deployment: no documents in `workspaces`, `workspaceMembers`, `workosOrganizationMemberships`, or `users` tables at run time.

## Commands run (dev)
1. `npx convex run performanceBackfills:backfillWorkspaceDenormalizedFields '{"workspaceSlug":"test","limit":20000}' --identity '{"subject":"user_01KH1V8ETCP8X40KSN4KPBSPVS"}'`
2. `npx convex run performanceBackfills:backfillWorkspaceDenormalizedFields '{"workspaceSlug":"nick-workspace","limit":20000}' --identity '{"subject":"user_01KH1V8ETCP8X40KSN4KPBSPVS"}'`
3. `npx convex run performanceBackfills:backfillWorkspaceDenormalizedFields '{"workspaceSlug":"unknown-workspace","limit":20000}' --identity '{"subject":"user_01KGZKM3SSYP2A8MB2R47BQF1H"}'`

## Results (dev)
- `test`
  - `applied: 0`
  - `exhaustedLimit: false`
- `nick-workspace`
  - `applied: 25`
  - `patchedProjects: 4`
  - `patchedComments: 5`
  - `patchedTasks: 9`
  - `patchedFiles: 3`
  - `patchedReactions: 4`
  - `exhaustedLimit: false`
- `unknown-workspace`
  - `applied: 7`
  - `patchedProjects: 2`
  - `patchedComments: 2`
  - `patchedTasks: 1`
  - `patchedFiles: 0`
  - `patchedReactions: 2`
  - `exhaustedLimit: false`

## Idempotency verification
Re-ran the backfill for `nick-workspace` and `unknown-workspace`.
- Both returned `applied: 0` and `exhaustedLimit: false`.

## Production
No workspace/user/membership records were present in production tables during this run, so no workspace-scoped backfill execution was performed there.
