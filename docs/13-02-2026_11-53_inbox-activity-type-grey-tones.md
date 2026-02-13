# Inbox activity type badges switched to neutral grey chrome

## Date
- 13-02-2026 11:53

## Goal
- Ensure activity type badges in Inbox activity records no longer use blue accent styling.
- Align non-task activity type badge chrome with the same neutral grey tone used by the task type badge.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - Changed `activityKindIconChrome()` for `collaboration`, `membership`, `workspace`, and `organization` to use:
    - `containerClass: "bg-surface-muted-soft"`
    - `iconClass: "text-text-muted-medium"`
  - Updated the fallback/default chrome to the same neutral values.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - Adjusted expectations for collaboration/membership/workspace/organization type badges from accent-blue classes to neutral grey class `bg-surface-muted-soft`.
  - Renamed affected test titles from "accent icon chrome" to "neutral icon chrome" for clarity.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅

## Notes
- `npm run test:frontend -- ...` in this repository executes the full frontend suite and currently reports unrelated pre-existing failures in `src/app/dashboard/useDashboardOrchestration.test.tsx` (`syncCurrentUserLinkedIdentityProvidersAction is not a function`).
