# Dashboard legacy shell one-shot removal

## Date
- 13-02-2026 12:24

## Goal
- Remove temporary `DashboardLegacyShell` + `VITE_DASHBOARD_REWRITE` runtime branching so dashboard always resolves through a single shell path.

## What changed
- Updated `/Users/nick/Designagency/src/app/DashboardApp.tsx`:
  - Removed `VITE_DASHBOARD_REWRITE` flag usage.
  - Removed lazy legacy shell import.
  - Simplified rendering to always mount `DashboardShell` behind existing `Suspense` fallback.
- Updated `/Users/nick/Designagency/src/app/DashboardApp.test.tsx`:
  - Removed legacy-shell mocking and env-flag branching tests.
  - Replaced with one deterministic test asserting `DashboardApp` renders `DashboardShell`.
- Removed `/Users/nick/Designagency/src/app/dashboard/DashboardLegacyShell.tsx`.
- Confirmed no non-doc references remain to `DashboardLegacyShell` or `VITE_DASHBOARD_REWRITE`.

## Validation
- `npm run lint` ⚠️ failed on existing repository size gates unrelated to this change:
  - `src/app/dashboard/useDashboardNavigation.ts` (>500 lines)
  - `convex/activities.ts` (>500 lines)
- `npm run typecheck` ✅
- `npm run test:frontend -- src/app/DashboardApp.test.tsx src/app/App.test.tsx src/app/dashboard/DashboardShell.test.tsx` ✅
- `npm run build` ✅
- `npm run perf:check` ✅

## Merge safety note
- Deployment environment audit for `VITE_DASHBOARD_REWRITE=false` remains a required pre-merge gate and must be completed outside this repo.
