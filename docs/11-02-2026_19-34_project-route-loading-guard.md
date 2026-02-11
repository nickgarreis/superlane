# Project route loading guard fix

**Date:** 11-02-2026 19:34

## What changed
- Updated `src/app/dashboard/useDashboardData.ts` to expose `projectsPaginationStatus` from the projects paginated query.
- Updated `src/app/dashboard/hooks/useDashboardDataLayer.ts` to pass `projectsPaginationStatus` into `useDashboardLifecycleEffects`.
- Updated `src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`:
  - Added a guard to skip invalid project-route redirects while projects are in `LoadingFirstPage`.
  - Replaced fragile `split(":")[1]` parsing with prefix slicing for `project:` and `archive-project:` route IDs.
- Updated `src/app/dashboard/useDashboardController.ts` to use the same prefix-slice route ID parsing.
- Added regression coverage in `src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx` to ensure we do not toast/redirect before project data finishes loading.

## Why
- Navigating from `/tasks` to `/project/:id` can change projects query args and briefly produce an empty first page while loading.
- The lifecycle effect previously treated this transient empty state as a hard “project missing” condition and redirected to `/tasks` with a toast.
- The new guard waits for first-page loading to complete before declaring the route invalid.

## Validation
- Ran `npm run test:frontend -- src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/dashboard/useDashboardController.test.tsx` (pass).
- Ran `npm run typecheck` (pass).
