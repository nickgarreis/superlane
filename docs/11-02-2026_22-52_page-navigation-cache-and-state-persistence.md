# Page navigation cache and state persistence

**Date:** 11-02-2026 22:52

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.ts`:
  - `navigateView` now no-ops when the target path already matches the current pathname.
  - `handleCloseSettings` now no-ops when destination already matches current pathname.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`:
  - `navigateToPath` and `navigateToPathWithReplace` now no-op for same-path navigations.

- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Split project subscriptions into two stable, always-on paginated queries:
    - `includeArchived: false`
    - `includeArchived: true`
  - Route switches now select between already-warm project sources instead of changing a single query arg.
  - Workspace task feed is kept warm whenever authenticated + workspace resolved.
  - Project task feed loads for active project/detail routes and is overlaid into `tasksByProject`.
  - Workspace files query now stays warm once search is opened during the session.
  - Added in-memory caches for project task/file paginated results to avoid transient empty states on route transitions.
  - Workspace members query is now kept warm for authenticated workspace sessions.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardContent.tsx`:
  - Added keep-alive behavior for heavy views (`Tasks`, `Archive`, `MainContent`) by keeping visited panes mounted and toggling visibility.
  - Cached last main-content model so project detail stays mounted when switching to other views.

- Added `/Users/nick/Designagency/src/app/dashboard/hooks/useSessionBackedState.ts`:
  - Generic sessionStorage-backed hook for persisted UI state (`dashboard:ui-state:v1:*`).

- Updated `/Users/nick/Designagency/src/app/components/Tasks.tsx`:
  - Persisted task page UI controls in session state:
    - search query
    - sort
    - selected project filters

- Updated `/Users/nick/Designagency/src/app/components/ArchivePage.tsx`:
  - Persisted archive search query in session state.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.tsx`:
  - Persisted per-project UI state in session state:
    - active file tab
    - file search query
    - file sort

- Updated tests:
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`
    - Adjusted query-order/behavior expectations for always-on warm data subscriptions.
  - `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`
    - Clears sessionStorage in `beforeEach` to avoid cross-test persistence bleed.

## Why
- Route changes were dropping subscriptions (`skip`) and unmounting heavy screens, causing visible reload behavior and lost page state.
- Keeping core data subscriptions warm plus selectively keeping heavy panes mounted removes the “leave page -> reload on return” UX.
- Persisting UI controls in session state preserves user context (search/filter/sort/tab) when navigating around the app.

## Validation
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx` ✅
  - (repo script runs the frontend suite; all tests passed)
- `npx eslint src/app/dashboard/hooks/useSessionBackedState.ts src/app/components/Tasks.tsx src/app/components/ArchivePage.tsx src/app/components/MainContent.tsx src/app/dashboard/components/DashboardContent.tsx src/app/dashboard/useDashboardNavigation.ts src/app/dashboard/hooks/useDashboardDataLayer.ts src/app/dashboard/useDashboardData.ts src/app/components/MainContent.test.tsx src/app/dashboard/useDashboardData.test.tsx` ✅
- `npm run typecheck` ✅
