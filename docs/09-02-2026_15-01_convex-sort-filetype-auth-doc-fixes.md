# Convex Sort, File Type, Auth, and Docs Fixes

## Summary
Implemented targeted backend safety and documentation fixes across dashboard sorting, file type inference, and project auth helpers.

## Changes Made
- Updated `convex/dashboard.ts` sort comparators to handle missing fields safely:
  - Projects now sort by `updatedAt` with fallback `0` when missing.
  - Tasks now sort by `position` with fallback `Infinity` when missing.
- Updated `convex/files.ts` file type inference:
  - Extension is only extracted when a dot exists in `name`.
  - Falls back to `FILE` when no usable extension is present.
- Hardened auth helper exposure in `convex/lib/auth.ts`:
  - Made raw project lookup helpers (`getActiveProjectByPublicId`, `getActiveProjectById`) internal/private.
  - Added authenticated wrapper `requireProjectRoleById(ctx, projectId, minimumRole)` for ID-based project access.
- Updated call sites to authenticated wrappers:
  - `convex/files.ts` remove flow now uses `requireProjectRoleById`.
  - `convex/comments.ts` update/remove/toggle flows now use `requireProjectRoleById` instead of raw project fetch + separate role lookup.
- Updated `docs/09-02-2026_14-53_p0-1-rbac-enforcement.md`:
  - Replaced absolute `/Users/nick/Designagency/...` paths with project-relative paths.
  - Reworded the `organizationSync.reconcileWorkspaceOrganizationMemberships` matrix note to explicitly describe retained owner/admin workspace membership-role validation and mention the standard helper comparison (`validateWorkspacePermissions`).

## Validation
- `npm run typecheck` passed.
- `npm run test:rbac` passed (6/6 tests).
