# Toggle-close behavior for Inbox sidebar button

**Date:** 12-02-2026 12:53

## What changed
- Updated sidebar inbox button wiring so it toggles:
  - If inbox is closed, clicking `Inbox` opens it.
  - If inbox is open, clicking `Inbox` closes it.
- Implemented at the dashboard chrome boundary by routing the sidebar callback to:
  - `openInbox` when `isInboxOpen === false`
  - `closeInbox` when `isInboxOpen === true`
- Added a regression test to verify close behavior when the inbox is already open.

## Files updated
- `src/app/dashboard/components/DashboardChrome.tsx`
- `src/app/dashboard/components/DashboardChrome.test.tsx`

## Validation
- `npx vitest run src/app/dashboard/components/DashboardChrome.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/dashboard/components/DashboardChrome.tsx src/app/dashboard/components/DashboardChrome.test.tsx` ✅
