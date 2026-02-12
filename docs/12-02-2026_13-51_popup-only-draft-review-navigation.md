# Enforce popup-only access for Draft/Review projects

## Date
- 12-02-2026 13:51

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardController.ts`:
  - Blocked embedded `main` rendering for project routes when project status is `Draft` or `Review`.
  - Preserved existing fallback logic to the first embeddable project (`Active`/`Completed` non-archived) or empty state.

- Added `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - New route guard that watches project route state.
  - For `/project/:id` routes that resolve to `Draft` or `Review`, opens the correct popup flow (`editProject` for drafts, `viewReviewProject` for review) and redirects to `/tasks` with `replace`.
  - Includes a per-path guard ref to prevent duplicate popup/redirect execution while the same route is in-flight.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Wired the new route guard to existing dashboard command handlers and router navigation.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchIndex.ts`:
  - Filtered out task results whose parent project is `Draft` or `Review`.
  - Filtered out file results whose parent project is `Draft` or `Review`.
  - Updated fallback project target selection (`firstActiveProjectId`) to avoid `Draft` and `Review` projects.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchDefaultContent.tsx`:
  - Removed `Draft`/`Review` projects from task suggestion sources.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`:
  - Hardened delete fallback navigation to only auto-open embeddable projects (not `Draft`/`Review`).

## Tests updated
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardController.test.tsx`:
  - Added assertions that `project:{id}` routes for `Draft` and `Review` do not render embedded main content.

- Added `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - Verifies draft route opens draft popup + redirects to `/tasks`.
  - Verifies review route opens review popup + redirects to `/tasks`.
  - Verifies guard waits while project pagination is `LoadingFirstPage`.
  - Verifies duplicate rerenders on the same path do not retrigger.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchPopupData.test.tsx`:
  - Added coverage ensuring Draft/Review project hits remain visible/selectable.
  - Added coverage ensuring Draft/Review task/file hits are excluded.

## Validation
- `npx vitest run src/app/dashboard/useDashboardController.test.tsx src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/components/search-popup/useSearchPopupData.test.tsx` ✅
- `npx eslint src/app/dashboard/useDashboardController.ts src/app/dashboard/useDashboardController.test.tsx src/app/dashboard/hooks/useDashboardActionLayer.ts src/app/dashboard/hooks/useDashboardProjectActions.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/components/search-popup/useSearchIndex.ts src/app/components/search-popup/useSearchDefaultContent.tsx src/app/components/search-popup/useSearchPopupData.test.tsx` ✅
- `npm run typecheck` ✅
