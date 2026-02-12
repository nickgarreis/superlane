# Important activity tagging with approved-style pill

## Date
- 12-02-2026 16:32

## Goal
Mark selected high-signal activities with an `Important` tag using the same visual style as the sidebar `Approved` tag.

## What changed
- Added a simple importance system:
  - `/Users/nick/Designagency/src/app/components/activities-page/activityImportance.ts`
  - Introduced deterministic `kind + action` mapping via `isImportantActivity(activity)`.
  - Current important actions:
    - `project`: `deleted`
    - `task`: `deleted`, `due_date_changed`, `assignee_changed`, `moved_project`
    - `collaboration`: `mention_added`
    - `file`: `upload_failed`
    - `membership`: `member_invited`, `member_role_changed`, `member_removed`
    - `workspace`: `workspace_general_updated`, `workspace_logo_removed`, `brand_asset_removed`
    - `organization`: `organization_membership_sync`

- Reused approved-pill style as a shared tokenized class:
  - `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`
  - Added `WARNING_STATUS_PILL_CLASS`.

- Unified sidebar approved badge with shared class (no visual change intended):
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`

- Added important pill rendering in activity shell:
  - `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`
  - New prop `isImportant?: boolean`; renders `Important` pill next to title.

- Wired importance into all activity row renderers:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

- Updated tests:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`
  - Added assertions for:
    - no important tag on non-important project creation
    - important tag and warning-pill style on collaboration mention
    - important tag on file upload failure

## Behavior change
- Selected high-signal activities now display an `Important` pill in both Inbox and Activities rows.
- The pill style matches the sidebar `Approved` pill style.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx vitest run src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/components/Sidebar.test.tsx` ✅
- `npx eslint src/app/components/ui/controlChrome.ts src/app/components/sidebar/SidebarItem.tsx src/app/components/activities-page/activityImportance.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ProjectActivityRow.tsx src/app/components/activities-page/rows/TaskActivityRow.tsx src/app/components/activities-page/rows/FileActivityRow.tsx src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/MembershipActivityRow.tsx src/app/components/activities-page/rows/WorkspaceActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npm run typecheck` ✅
