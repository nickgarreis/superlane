# Inbox activity rows: increase message-to-action spacing for Mark read

## Date
- 13-02-2026 09:57

## Goal
Increase the horizontal gap between inbox activity message content and the top-right `Mark read` action button.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - added optional `isInboxLayout` prop (default `false`).
  - when top actions are present, content right padding is now:
    - `pr-20` for inbox layout
    - `pr-16` for non-inbox layout (unchanged)

- Updated inbox-capable activity row renderers to pass the inbox layout flag when `mentionMode === "inbox"`:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
