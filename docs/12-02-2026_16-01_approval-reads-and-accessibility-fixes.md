# Approval reads and accessibility fixes

## Date
- 12-02-2026 16:01

## Goal
- Normalize `markApprovalSeen` return shape in Convex.
- Improve accessibility and semantics in Draft Pending Projects popup.
- Align inbox activity header horizontal spacing.
- Remove duplicate workspace context item value in activity rows.

## What changed
- Updated `/Users/nick/Designagency/convex/projects.ts`:
  - ensured all `markApprovalSeen` return paths include `lastSeenApprovedAt`
  - `approvedAt === null` now returns `lastSeenApprovedAt: null`
  - idempotent early-return branch now returns `lastSeenApprovedAt: existingRead.lastSeenApprovedAt`

- Updated `/Users/nick/Designagency/src/app/components/DraftPendingProjectsPopup.tsx`:
  - added `aria-label="Close"` to the icon-only close button
  - converted sortable header cells (`Project`, `Category`, `Status`) from non-semantic `div`s to semantic `button` elements while preserving existing class-based styling and click sort behavior

- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - removed `px-4` from the `Activity` section header row to avoid double horizontal padding against the parent scroll container

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`:
  - removed the `Workspace Name` context item from `workspace_general_updated` rows to avoid duplicate value display with `To`

- Added/updated tests:
  - `/Users/nick/Designagency/convex/__tests__/projects_lifecycle_invariants.test.ts`
    - asserted `lastSeenApprovedAt` for true/false mark-seen paths
    - added coverage for unapproved projects returning `lastSeenApprovedAt: null`
  - `/Users/nick/Designagency/src/app/components/DraftPendingProjectsPopup.test.tsx`
    - asserted close button accessible name
    - added keyboard sorting coverage for sortable header buttons
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`
    - added coverage ensuring workspace update rows do not render duplicate `Workspace Name` context item

## Validation
- `npx eslint convex/projects.ts convex/__tests__/projects_lifecycle_invariants.test.ts src/app/components/DraftPendingProjectsPopup.tsx src/app/components/DraftPendingProjectsPopup.test.tsx src/app/components/InboxSidebarPanel.tsx src/app/components/activities-page/rows/WorkspaceActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npm test -- convex/__tests__/projects_lifecycle_invariants.test.ts` ✅
- `npm test -- src/app/components/DraftPendingProjectsPopup.test.tsx` ✅
- `npm test -- src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npm test -- src/app/components/activities-page/rows/ActivityRows.test.tsx -t "renders workspace updates without duplicate workspace-name context item"` ✅
