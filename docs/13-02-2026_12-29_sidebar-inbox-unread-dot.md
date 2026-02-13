# Sidebar inbox unread indicator dot

## Date
- 13-02-2026 12:29

## Goal
- Replace the numeric unread badge on the sidebar Inbox action with a simple blue dot indicator.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.tsx`:
  - Replaced numeric `inboxBadge` text generation with a visual dot element rendered only when `inboxUnreadCount > 0`.
  - Added `data-testid="inbox-unread-dot"` for deterministic tests and `aria-label="Unread inbox messages"` for assistive text.
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - Broadened `badge` prop type to `React.ReactNode`.
  - Preserved existing numeric/string badge behavior via `SidebarTag`.
  - Added support to render custom badge nodes directly (used by the Inbox blue dot).
- Updated tests:
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx`
  - `/Users/nick/Designagency/src/app/components/Sidebar.test.tsx`
  - Replaced text-badge assertions (`"7"`, `"99+"`) with blue-dot presence/absence assertions.

## Validation
- `npm run test:frontend -- src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/Sidebar.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarPrimaryActions.tsx src/app/components/sidebar/SidebarItem.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/Sidebar.test.tsx` ✅
