# Sidebar project list stability across tasks/archive navigation

**Date:** 11-02-2026 22:16

## What changed
- Updated `src/app/dashboard/useDashboardData.ts` to split project data consumption paths:
  - Kept the existing route-aware `projectsResult` (can include archived projects for archive/search/detail contexts).
  - Added a sidebar-specific non-archived fallback query (`includeArchived: false`) that is activated when the route-aware query includes archived projects.
  - Added `sidebarVisibleProjects` to the hook result so sidebar rendering can remain stable while archive-oriented project queries load first page.
  - Kept `visibleProjects` for main content rendering (archive page still receives archive-capable project data).
- Updated `src/app/dashboard/hooks/useDashboardViewBindings.ts`:
  - Sidebar (`DashboardChrome`) now receives `data.sidebarVisibleProjects`.
  - Main content (`DashboardContent`) continues to receive `data.visibleProjects`.
- Updated `src/app/dashboard/useDashboardData.test.tsx`:
  - Adjusted paginated-query index expectations for the added sidebar query path.
  - Added regression test `keeps sidebar projects stable while archive projects query loads` to verify sidebar project list does not drop during `/tasks` -> `/archive` transition while archive query is in `LoadingFirstPage`.

## Why
- The sidebar project list was bound to the same query state used by archive-capable content. Navigating between `/tasks` and `/archive` changed project query args (`includeArchived`), causing a first-page reload and visible sidebar list churn.
- Decoupling sidebar project data from archive-capable query state removes that UX regression while preserving archive page behavior.

## Validation
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx` ✅
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx src/app/dashboard/hooks/useDashboardViewBindings.test.tsx` ✅ (executed first; one transient test expectation issue fixed afterward)
- `npm run typecheck` ⚠️ blocked by pre-existing unrelated error in `convex/tasks.ts`:
  - `TS2769` at `convex/tasks.ts:281` (reduce overload mismatch)
