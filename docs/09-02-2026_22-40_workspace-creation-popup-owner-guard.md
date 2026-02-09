# Workspace Creation Popup + Owner Guard

**Date:** 09-02-2026 22:40

## Summary

Implemented a proper workspace creation flow from the sidebar workspace dropdown:
- replaced the prompt-based flow with a centered modal popup,
- added optional company profile image upload during workspace creation,
- enforced owner-only workspace creation in both frontend and backend.

## Changes

### Frontend

- Added a new popup component:
  - `src/app/components/create-workspace-popup/CreateWorkspacePopup.tsx`
  - `src/app/components/CreateWorkspacePopup.tsx` (re-export)
- Popup behavior:
  - centered modal with backdrop,
  - workspace name input,
  - optional image upload + preview + remove,
  - submit/cancel controls and loading/error handling,
  - escape and backdrop close handling.
- Wired popup lifecycle into dashboard navigation and lazy loading:
  - `src/app/dashboard/useDashboardNavigation.ts`
  - `src/app/dashboard/DashboardShell.tsx`
- Replaced old `window.prompt` workspace creation flow with popup submit handler.
- Reused existing workspace logo upload pipeline for optional logo upload after create:
  - generate upload URL,
  - upload to Convex storage,
  - finalize workspace logo mutation.
- Added owner-only UI gating for workspace creation:
  - `src/app/components/Sidebar.tsx`
  - `Create Workspace` row is disabled/non-interactive for non-owners.

### Backend

- Added owner-role enforcement in workspace creation action:
  - `convex/workspaces.ts`
- `workspaces.create` now rejects users who already have accessible workspace memberships but none with `owner` role.
- Preserved bootstrap behavior for unaffiliated users (no accessible memberships).

### Tests

- Added backend coverage for owner-only create restriction:
  - `convex/__tests__/workspaces_workos_linking.test.ts`
  - new test: non-owner (admin) cannot create additional workspaces.

## Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:backend -- convex/__tests__/workspaces_workos_linking.test.ts` ✅
- `npm run test:frontend` ✅
