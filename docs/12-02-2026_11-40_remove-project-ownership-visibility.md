# Remove project ownership/visibility functionality

**Date:** 12-02-2026 11:40

## What changed
- Removed project ownership/visibility controls from the create/edit project flow:
  - Deleted owner + visibility section from step 2 UI.
  - Removed wizard state/effects/submission handling for owner/visibility.
  - Removed owner/visibility from create/update payload construction and draft restore paths.

- Updated frontend project types/mapping to creator-only model:
  - Removed owner/visibility fields from project draft and project UI data models.
  - Removed owner/visibility mapping in snapshot-to-UI project mapper.
  - Removed owner/visibility wiring from dashboard project actions and action layer.

- Removed backend ownership/visibility behavior:
  - `convex/lib/auth.ts`: removed private-project access gating.
  - `convex/activities.ts`: removed private-event visibility filtering.
  - `convex/tasks.ts` and `convex/files.ts`: removed workspace-list filtering based on private visibility.
  - `convex/projects.ts`:
    - removed `ownerUserId`/`visibility` mutation args,
    - removed owner/visibility update logic and related propagation,
    - removed `owner_changed` and `visibility_changed` project activity emission,
    - removed internal backfill mutation `internalBackfillOwnershipVisibility`.
  - Removed project owner/visibility context attachment from task/file/comment activity logging payloads.

- Kept Activities page itself intact; only ownership/visibility behavior was removed.

## Validation
- `npm run typecheck` ✅
- `npm test` ✅
- `npm run lint` ✅
