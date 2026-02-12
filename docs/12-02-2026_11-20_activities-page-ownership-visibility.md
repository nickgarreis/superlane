# Activities page + ownership/visibility rollout

**Date:** 12-02-2026 11:20

## What changed
- Implemented protected workspace Activities surface and routing/navigation wiring:
  - Added `/activities` view mapping and protected routing support.
  - Added sidebar entry and search quick action.
  - Integrated Activities content model into dashboard controller/data bindings.

- Implemented Activities UI with Tasks/Archive layout parity:
  - Added `src/app/components/Activities.tsx` with session-backed search/filter state and incremental loading.
  - Added `src/app/components/activities-page/ActivitiesView.tsx` and shared chrome helpers.
  - Added dedicated row renderers per category:
    - Project, Task, Collaboration, File, Membership, Workspace.

- Added tokenized visual system for Activities:
  - Added activity semantic tokens in `src/styles/theme.css`.
  - Added `activityChrome` class constants.
  - Ensured new Activities UI avoids hardcoded color values.

- Added workspace activity event model and API:
  - Added `workspaceActivityEvents` table + indexes.
  - Added typed helper `convex/lib/activityEvents.ts` for consistent event writes.
  - Added query `api.activities.listForWorkspace` with pagination, kind filtering, and private-project visibility filtering.

- Added ownership/visibility model:
  - Added project visibility validator.
  - Extended `projects` with owner snapshot + visibility fields.
  - Extended `tasks` and `projectFiles` with denormalized project owner/visibility fields.
  - Enforced private project access (`owner + admins/owners`) in project auth checks and list queries.

- Wired event emission for activity categories (excluding notification preference changes):
  - Projects, tasks, collaboration/comments/reactions/mentions, files (including upload failure), membership/settings, organization membership sync summary.

- Added propagation + migration support:
  - Project owner/visibility create/update defaults and admin/owner-only change controls.
  - Propagation of owner/visibility to related tasks/files on project updates.
  - Internal backfill mutation to default legacy rows (`owner = creator`, `visibility = workspace`) and sync denormalized task/file metadata.

- Extended create/edit project UI payload and controls:
  - Added owner/visibility fields to frontend payload/state/types.
  - Passed workspace members into wizard and rendered owner/visibility controls only for admin/owner users.

- Added/updated tests for activities content model, routing, quick actions, Activities UI, row rendering, and backend visibility/event behavior.

## Follow-up compile/test fixes completed in this pass
- Fixed backend typecheck issues in:
  - `convex/lib/auth.ts`
  - `convex/projects.ts`
  - `convex/tasks.ts`
  - `convex/__tests__/activities_and_visibility.test.ts`
- These fixes preserved lint any-budget and Convex typecheck compatibility.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm test` ✅
