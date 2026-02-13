# Shared scrollbar visibility and sizing across dashboard surfaces

## Date
- 13-02-2026 12:02

## Goal
- Hide scrollbars by default and only reveal them while the user is actively scrolling.
- Reuse a single scrollbar visual style across all scrollable areas.
- Support a larger scrollbar size on full-page content areas while keeping popups/lists more minimal.

## What changed
- Added `/Users/nick/Designagency/src/app/lib/useSharedScrollbarVisibility.ts`:
  - Registers one global scroll listener (capture + passive).
  - Detects the active scroll host and toggles a temporary `scrollbar-active` class.
  - Removes the class after a short idle delay (720ms).

- Updated `/Users/nick/Designagency/src/app/App.tsx`:
  - Wired in `useSharedScrollbarVisibility()` so the behavior applies app-wide.

- Updated `/Users/nick/Designagency/src/styles/theme.css`:
  - Added a shared scrollbar system for `html` and all Tailwind overflow utility containers.
  - Scrollbars are hidden on default (`scrollbar-width: none`, transparent WebKit thumb).
  - Scrollbars appear only when `scrollbar-active` is present.
  - Added `scrollbar-page` size variant (`10px`) while default remains compact (`6px`).

- Updated page-level scroll containers to use the larger variant:
  - `/Users/nick/Designagency/src/app/components/tasks-page/TasksView.tsx`
  - `/Users/nick/Designagency/src/app/components/ArchivePage.tsx`
  - `/Users/nick/Designagency/src/app/components/MainContent.tsx` (page mode only; popup mode remains compact)

## Validation
- `npm run typecheck:frontend` ✅
- `npm run lint` ⚠️ fails due pre-existing quality gate issues unrelated to this change:
  - `src/app/dashboard/useDashboardNavigation.ts` exceeds feature file size threshold
  - `convex/activities.ts` exceeds feature file size threshold
