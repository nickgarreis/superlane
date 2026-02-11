# Sidebar sections stability between tasks and archive

**Date:** 11-02-2026 22:33

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Added a dedicated sidebar projects subscription using `api.projects.listForWorkspace` with stable args:
    - `includeArchived: false` (always, whenever authenticated + workspace resolved).
  - Kept existing route-aware projects subscription for content/search/archive behavior:
    - `includeArchived` still depends on route/search/detail context.
  - Split mapped project sets:
    - `projectsByRoute` (route-aware)
    - `sidebarProjects` (stable non-archived)
  - Added `sidebarVisibleProjects` to returned hook state and switched `visibleProjectIds` derivation to this stable sidebar source.
  - Kept content-facing `visibleProjects` route-aware for archive/main-content behavior.
  - Passed `projectsByRoute` + `sidebarVisibleProjects` into `useDashboardController` so route checks still see archived projects while fallback selection remains sidebar-stable.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`:
  - `DashboardChrome` now receives `data.sidebarVisibleProjects`.
  - `DashboardContent` remains on `data.visibleProjects`.
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`:
  - Updated call-order expectations for the added always-on sidebar query.
  - Added regression test:
    - `keeps sidebar active and completed project data stable while archive query reloads`
    - Verifies both active and completed sidebar project entries remain available when switching from `tasks` to `archive` while route-aware archive query is `LoadingFirstPage`.

## Why
- Sidebar active and completed sections both derive from the same project object source.
- Previously that source used route-dependent query args; switching `/tasks <-> /archive` changed `includeArchived`, triggering first-page reset and causing both sections to visibly reload.
- A dedicated, always-stable non-archived sidebar query prevents that churn for both sections.

## Validation
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx` ✅
- `npm run typecheck` ✅
- `npx eslint src/app/dashboard/useDashboardData.ts src/app/dashboard/hooks/useDashboardViewBindings.ts src/app/dashboard/useDashboardData.test.tsx` ✅
