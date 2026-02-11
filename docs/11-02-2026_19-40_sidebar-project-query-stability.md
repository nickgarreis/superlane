# Sidebar project query stability between tasks and project routes

**Date:** 11-02-2026 19:40

## What changed
- Updated `src/app/dashboard/useDashboardData.ts` to compute `shouldIncludeArchivedProjects` using archive-specific views only:
  - `currentView === "archive"`
  - `currentView.startsWith("archive-project:")`
  - plus existing explicit cases (`isSearchOpen`, completed-project detail popup)
- Added a regression test in `src/app/dashboard/useDashboardData.test.tsx`:
  - `keeps project query args stable between tasks and project routes`
  - verifies `includeArchived` remains `false` when navigating from `tasks` to `project:{id}` with search closed.

## Why
- The projects paginated query previously switched `includeArchived` from `false` on `tasks` to `true` on `project:{id}`.
- That changed the Convex query key, causing a first-page reload and sidebar project section refresh when moving between tasks and project pages.
- Archive routes still require archived projects, so the include-archived behavior is now scoped to archive contexts.

## Validation
- Ran `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx` (pass).
- Ran `npm run typecheck` (pass).
