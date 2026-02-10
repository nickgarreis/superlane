# Accessibility and Runtime Safety Fixes

**Date:** 2026-02-10 12:18

## Summary

Implemented requested UI accessibility, action safety, and hook reliability fixes across search popup, file sorting, project menu controls, dashboard lifecycle/sign-out flows, and upload helper tests.

## Changes

- `src/app/components/SearchPopup.tsx`
  - Removed the `if (!isOpen) return null;` early return so `AnimatePresence` stays mounted.
  - Kept popup body conditionally rendered with `{isOpen && (...)}` to allow exit animations.

- `src/app/components/main-content/FileSection.tsx`
  - Added `type="button"`, `aria-haspopup="true"`, and `aria-expanded={isSortOpen}` to the sort toggle.
  - Added Escape-key handling on the sort toggle and dropdown container to close the menu.
  - Added `type="button"` to sort option buttons.

- `src/app/components/main-content/MenuIcon.tsx`
  - Replaced non-semantic trigger `<div>` with a semantic `<button>`.
  - Added `type="button"`, `aria-expanded`, `aria-haspopup="menu"`, and `aria-label="Toggle menu"` on trigger.
  - Added `disabled={!canManageProjectLifecycle}` to permission-gated menu action buttons while preserving existing click guards and styles.

- `src/app/components/project-tasks/ProjectTaskRows.tsx`
  - Added `alt` text for assignee avatar image using assignee name fallback.
  - Added `alt` text for member avatar image using member name fallback.

- `src/app/components/search-popup/useSearchPopupData.tsx`
  - File entries now skip `items.push` when no `targetProject` is available, avoiding undefined `projectId` values.
  - Quick-action entries now guard `actionHandlers[act.id]` and skip actions without a valid handler.

- `src/app/dashboard/hooks/useDashboardApiHandlers.ts`
  - Renamed bound action variable to `ensureDefaultWorkspaceAction` and returned it under that name.

- `src/app/dashboard/DashboardShell.tsx`
  - Updated destructuring to `ensureDefaultWorkspaceAction` and passed it to lifecycle effects.

- `src/app/dashboard/DashboardShell.test.tsx`
  - Updated mocked API handlers to expose `ensureDefaultWorkspaceAction`.

- `src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`
  - Captured `resolvedWorkspaceSlug` into local `slug` before async organization-link flow.
  - Used captured `slug` in `ensureOrganizationLinkAction` and reconciliation call.

- `src/app/dashboard/hooks/useDashboardPopupBindings.ts`
  - Updated `handleSignOut` to `await signOut()` inside `try/catch` and log failures.

- `src/app/dashboard/lib/uploadHelpers.test.ts`
  - Added `afterEach` cleanup with `vi.unstubAllGlobals()`.

## Validation

- `npm run test:frontend -- src/app/dashboard/lib/uploadHelpers.test.ts src/app/dashboard/DashboardShell.test.tsx src/app/components/search-popup/useSearchPopupData.test.tsx`
- `npm run typecheck:frontend`
- `npm run lint`

All commands passed.
