# P0.1 RBAC Enforcement Implementation

## Scope Delivered
Implemented full backend RBAC boundary enforcement for Convex mutations, added privileged-operation actor traceability, and converted project deletion from hard delete to logical delete while hiding deleted projects and related records from UI-facing queries.

## RBAC Source of Truth
Added `convex/lib/rbac.ts` with:
- Role hierarchy and comparator:
  - `WorkspaceRole`: `owner | admin | member`
  - `ROLE_RANK`
  - `hasRequiredWorkspaceRole(role, minimumRole)`
- Typed matrix constant: `RBAC_MATRIX`

### Enforced Matrix
| Function | Access |
|---|---|
| `workspaces.create` | authenticated user |
| `workspaces.ensureDefaultWorkspace` | authenticated user |
| `workspaces.update` (general fields) | minimum `admin` |
| `workspaces.update.workosOrganizationId` | `owner` only |
| `projects.create` | minimum `member` |
| `projects.update` | minimum `member` (status transition still requires admin) |
| `projects.updateReviewComments` | minimum `member` |
| `projects.setStatus` | minimum `admin` |
| `projects.archive` | minimum `admin` |
| `projects.unarchive` | minimum `admin` |
| `projects.remove` | minimum `admin` |
| `tasks.replaceForProject` | minimum `member` |
| `tasks.bulkReplaceForWorkspace` | minimum `member` |
| `files.create` | minimum `member` |
| `files.remove` | minimum `member` |
| `comments.create` | minimum `member` |
| `comments.toggleReaction` | minimum `member` |
| `comments.toggleResolved` | minimum `member` |
| `comments.update` | author OR minimum `admin` |
| `comments.remove` | author OR minimum `admin` |
| `organizationSync.reconcileWorkspaceOrganizationMemberships` | system path with explicit owner-or-admin workspace role validation retained (the function directly checks active workspace membership + role lookup on the target workspace instead of the standard `validateWorkspacePermissions` helper, and this special-case logic is intentionally kept in `organizationSync.reconcileWorkspaceOrganizationMemberships`) |
| `organizationSyncInternal.applyOrganizationMembershipSnapshot` | internal system-only |

## Shared Helper Contract
Updated `convex/lib/auth.ts` to add:
- `requireWorkspaceRole(ctx, workspaceId, minimumRole, options?)`
- `getActiveProjectByPublicId(ctx, publicId)`
- `getActiveProjectById(ctx, projectId)`
- `requireProjectRole(ctx, publicId, minimumRole)`

Behavior:
- Role denial on existing resources -> `ConvexError("Forbidden")`.
- Deleted or missing projects -> `ConvexError("Project not found")`.

## Schema Changes
Updated `convex/schema.ts`:

### `workspaces`
- Added optional:
  - `updatedByUserId`

### `projects`
- Added optional:
  - `deletedAt`
  - `deletedByUserId`
  - `updatedByUserId`
  - `statusUpdatedByUserId`
  - `archivedByUserId`
  - `unarchivedByUserId`

## Mutation Boundary Changes
### Workspace
`convex/workspaces.ts`
- `update` now requires admin minimum.
- `workosOrganizationId` changes now require owner role.
- Tracks actor via `updatedByUserId`.

### Projects
`convex/projects.ts`
- Uses role helpers for all mutation boundaries.
- Lifecycle operations require admin minimum.
- Logical delete implemented in `remove`:
  - sets `deletedAt`, `deletedByUserId`, `updatedAt`
  - no physical row deletion
- Privileged actor tracking:
  - `updatedByUserId` (`update`)
  - `statusUpdatedByUserId` (`setStatus`, and status path in `update`)
  - `archivedByUserId` (`archive`)
  - `unarchivedByUserId` (`unarchive`)
  - `deletedByUserId` (`remove`)

### Tasks
`convex/tasks.ts`
- Project/workspace mutation paths now role-gated at member minimum.
- Bulk replacement rejects deleted projects as not found.

### Files
`convex/files.ts`
- Create/remove role-gated at member minimum.
- Remove rejects deleted-parent-project flows as not found.
- Workspace listing excludes files for deleted projects.

### Comments
`convex/comments.ts`
- Create/toggle paths role-gated at member minimum.
- Update/remove now: author OR admin/owner override.
- All comment-by-id write paths enforce parent project active (not deleted).

### Internal Sync
`convex/organizationSyncInternal.ts`
- Reconciliation context check updated to shared `requireWorkspaceRole(..., "admin")` helper.

## Deleted Project Visibility Rules
Implemented hidden-everywhere behavior for deleted projects:
- `convex/dashboard.ts`
  - excludes deleted projects
  - excludes tasks whose project is deleted
- `convex/files.ts`
  - workspace file list excludes files tied to deleted projects
- project-scoped reads/writes in projects/tasks/files/comments treat deleted project as not found

## Test Harness and Coverage
Added:
- `vitest.config.ts`
- `convex/__tests__/rbac.test.ts`
- `convex/import-meta.d.ts`

Test stack:
- `vitest`
- `convex-test`
- WorkOS AuthKit component registration in tests via `@convex-dev/workos-authkit/test`

Coverage implemented:
- role hierarchy helper
- workspace update (admin minimum + owner-only org mapping + actor)
- lifecycle role denials and actor fields
- member collaboration update allowances + status protection
- comment author/admin override + member resolve
- soft delete retention + hidden-from-queries behavior
- forbidden error semantics on role denial

## Tooling Updates
Updated `package.json`:
- Added script: `test:rbac`
- Added dev dependencies:
  - `vitest`
  - `convex-test`
