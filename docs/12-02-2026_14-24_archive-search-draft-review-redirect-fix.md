# Fix archive/search Draft-Review redirect race

## Date
- 12-02-2026 14:24

## Goal
Ensure Draft/Review project selection from Search while on `/archive` always opens popup-only flow and returns to `/archive` instead of falling back to `/tasks` during transient project-map swaps.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`:
  - Added a transient in-memory `projectCacheRef` used during route validation.
  - Route checks for `project:` and `archive-project:` now resolve project data from current map first, then cached map.
  - Added workspace-scoped cache reset keyed by `resolvedWorkspaceSlug` to prevent cross-workspace stale cache usage.
  - Kept existing invalid-route behavior intact when project is truly missing from both sources.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - Clarified direct deep-link Draft route fallback test naming.
  - Added regression test for Review route from `/archive` when selected project is absent from the immediate current map but present in cache.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx`:
  - Added regression test proving route validation does not incorrectly emit "Project not found"/`/tasks` redirect when route project is still available from cache during archive/search map swap.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx` ✅
- `npx vitest run src/app/dashboard/useDashboardOrchestration.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDashboardLifecycleEffects.ts src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
