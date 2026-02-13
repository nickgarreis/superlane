# Search-to-modal atomic handoff

## Date
- 13-02-2026 11:47

## Goal
- Remove the residual UX blip where the previous background page briefly reappears between Search and Draft/Pending/Completed modal routes.

## Root cause
- Search was still being closed before destination modal visibility was guaranteed, creating a transient no-modal window.
- During that window, the `from` background view is visible by design, which looked like a page overlay/reload artifact.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`:
  - Added atomic handoff ref state for search transitions:
    - `pendingSearchHandoffTargetRef` (`completed` | `draftPending` | `null`)
  - Added `handleSearchClose` guard that defers Search close while handoff is pending.
  - `handleSearchNavigate` now marks handoff target before route navigation for:
    - `completed-project:*`
    - `draft-project:*`
    - `pending-project:*`
  - Added effect to close Search only after the destination popup is actually open:
    - waits on `isCompletedProjectsOpen` / `isDraftPendingProjectsOpen`
  - Added cleanup effect to clear pending handoff when Search is fully closed.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchResults.tsx`:
  - For project entries, action order is now `onNavigate(...)` then `onClose()`.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchDefaultContent.tsx`:
  - For project actions (recent/default/suggestions), action order is now `onNavigate(...)` then `onClose()`.

## Why this fixes it
- Search remains mounted during transition until the target modal is confirmed open.
- This removes the intermediate frame where only the background page is visible.
- Result is a single, continuous modal handoff instead of close-then-open flicker.

## Validation
- `npx eslint src/app/dashboard/components/DashboardPopups.tsx src/app/components/search-popup/useSearchResults.tsx src/app/components/search-popup/useSearchDefaultContent.tsx` ✅
- `npx vitest run src/app/dashboard/components/DashboardPopups.test.tsx src/app/components/search-popup/useSearchPopupData.test.tsx` ✅
