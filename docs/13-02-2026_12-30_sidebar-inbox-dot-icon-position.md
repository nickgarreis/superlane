# Sidebar inbox dot icon positioning

## Date
- 13-02-2026 12:30

## Goal
- Reposition the sidebar Inbox unread indicator dot so it is absolutely placed on the top-right corner of the Inbox icon.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.tsx`:
  - Removed use of `badge` slot for Inbox unread indicator.
  - Wrapped the Inbox icon in a `relative` icon container.
  - Rendered the unread dot as an absolutely positioned element (`absolute -top-0.5 -right-0.5`) inside that container.
  - Kept conditional visibility tied to `inboxUnreadCount > 0`.

## Validation
- `npm run test:frontend -- src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/Sidebar.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarPrimaryActions.tsx` ✅
