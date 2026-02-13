# Search popup status-route direct navigation fix

## Date
- 13-02-2026 11:30

## Goal
- Eliminate background flicker / wrong-origin transitions when opening Draft, Review (Pending), and Completed projects from Search.
- Remove transient `/project/:id` routing hops for non-active statuses.

## What changed
- Added `/Users/nick/Designagency/src/app/components/search-popup/navigationIntent.ts`:
  - centralized project intent mapping from project status to route intent:
    - `Draft` -> `draft-project:{id}`
    - `Review` -> `pending-project:{id}`
    - `Completed` -> `completed-project:{id}`
    - archived -> `archive-project:{id}`
    - active -> `project:{id}`

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchResults.tsx`:
  - project search result clicks now use the centralized status-aware intent mapper.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchDefaultContent.tsx`:
  - default/recent/suggestion project navigation now uses the centralized status-aware intent mapper.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/dashboardPopups.types.ts`:
  - added `currentView` prop.
  - widened `openCompletedProjectDetail` signature to accept optional `{ replace?, from? }`.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`:
  - search navigation now handles `draft-project:*`, `pending-project:*`, and `completed-project:*` directly via navigation helpers (no `project:*` intermediary).
  - search-origin `from` is now explicitly derived from visible `currentView` (`viewToPath(currentView)`), avoiding stale query propagation.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`:
  - forwards `navigation.currentView` into `DashboardPopups` props.

- Updated tests:
  - `/Users/nick/Designagency/src/app/components/search-popup/useSearchPopupData.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`

## Why this fixes UX
- Draft/Review search results previously navigated to `project:{id}`, then guard-redirected to draft/pending popup routes, causing transient background recomputation and visual flicker.
- Direct status-aware routing removes that intermediate hop.
- Explicit `from` from current visible view keeps popup background stable and aligned with what the user is actually viewing.

## Validation
- `npx eslint src/app/components/search-popup/navigationIntent.ts src/app/components/search-popup/useSearchResults.tsx src/app/components/search-popup/useSearchDefaultContent.tsx src/app/components/search-popup/useSearchPopupData.test.tsx src/app/dashboard/components/dashboardPopups.types.ts src/app/dashboard/components/DashboardPopups.tsx src/app/dashboard/components/DashboardPopups.test.tsx src/app/dashboard/hooks/useDashboardViewBindings.ts` ✅
- `npx vitest run src/app/components/search-popup/useSearchPopupData.test.tsx src/app/dashboard/components/DashboardPopups.test.tsx` ✅
- `npm run typecheck` ✅

## Notes
- Additional run: `npx vitest run src/app/dashboard/DashboardShell.test.tsx src/app/dashboard/useDashboardOrchestration.test.tsx`
  - `DashboardShell` test passed.
  - `useDashboardOrchestration` failed due unrelated existing mock issue: `syncCurrentUserLinkedIdentityProvidersAction is not a function`.
