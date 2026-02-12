# Remove legacy Activities page while preserving Inbox functionality

## Date
- 12-02-2026 17:06

## Goal
Remove legacy standalone Activities page routing/view plumbing without impacting Inbox activity functionality.

## What changed
- Updated `/Users/nick/Designagency/src/app/App.tsx`:
  - removed explicit `/activities` redirect route.

- Updated `/Users/nick/Designagency/src/app/lib/routing.ts`:
  - removed `"activities"` from `AppView`.
  - removed `/activities` mapping from `viewToPath()`.
  - removed `/activities` parsing from `pathToView()`.
  - removed `/activities` from `isProtectedPath()`.

- Updated `/Users/nick/Designagency/src/app/lib/seo.ts`:
  - removed `/activities` title branch.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`:
  - added canonical unknown-route redirect to `/tasks` when `pathToView(locationPathname)` is `null` and path is not `/settings`.

- Updated `/Users/nick/Designagency/src/app/dashboard/types.ts`:
  - removed `{ kind: "activities" }` from `DashboardContentModel`.

- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardController.ts`:
  - removed `currentView === "activities"` content model branch.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardContent.tsx`:
  - removed lazy import/rendering/state for legacy `Activities` pane.
  - removed legacy-only props: `workspaceActivities`, `activitiesPaginationStatus`, `loadMoreWorkspaceActivities`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`:
  - removed passing legacy activities-pane props into `DashboardContent`.

- Deleted legacy page-only files:
  - `/Users/nick/Designagency/src/app/components/Activities.tsx`
  - `/Users/nick/Designagency/src/app/components/Activities.test.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/ActivitiesView.tsx`

- Updated tests:
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardContent.test.tsx`
    - removed legacy Activities mock/test and obsolete props.
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardController.test.tsx`
    - removed `activities` view expectation.
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.test.tsx`
    - changed `/activities` expectation to fallback `tasks` view.
    - added unknown path fallback assertion.
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx`
    - added unknown route redirect coverage (including `/activities` -> `/tasks`).
    - added missing `locationSearch` field in test args for parity with hook args.
  - `/Users/nick/Designagency/src/app/lib/seo.test.ts`
    - updated expectation so `/activities` now resolves to default page title.

## Inbox safety notes
- Inbox-related shared activity rendering and behavior were intentionally preserved:
  - `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/*.tsx`
  - backend activity feed/mutations remained unchanged.

## Validation
- `npx vitest run src/app/dashboard/useDashboardController.test.tsx src/app/dashboard/components/DashboardContent.test.tsx src/app/dashboard/useDashboardNavigation.test.tsx src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/components/InboxSidebarPanel.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run lint` ⚠️ fails existing repo gate: `convex/activities.ts` exceeds feature file-size limit (>500 lines).
- `npm run test:frontend` ⚠️ one unrelated pre-existing failure: `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx` expected key-count mismatch (45 vs 47).
