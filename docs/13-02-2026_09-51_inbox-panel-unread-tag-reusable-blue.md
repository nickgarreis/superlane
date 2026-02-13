# Inbox panel header unread counter migrated to reusable blue SidebarTag

## Date
- 13-02-2026 09:51

## Goal
Replace the inbox panel header unread counter with the reusable tag component and apply the same blue token styling already used for inbox unread badges.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - imported `SidebarTag` from `./sidebar/SidebarTag`.
  - replaced header unread-count span with:
    - `<SidebarTag tone="inboxUnread">{unreadCount > 99 ? "99+" : unreadCount} unread</SidebarTag>`
  - preserves existing unread visibility behavior (`unreadCount > 0` gate) and count capping.

- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx`:
  - in the main rendering test, updated unread badge assertion to verify:
    - presence of `1 unread`
    - `data-sidebar-tag-tone="inboxUnread"`
    - `txt-tone-accent`

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx` ✅
- `npx eslint /Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx /Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx` ✅
- `npm run build` ✅
