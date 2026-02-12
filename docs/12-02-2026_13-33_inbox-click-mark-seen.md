# Inbox click marks records as seen

## Problem
- Clicking an inbox activity row navigated to the linked destination, but did not mark unread items as seen.

## Changes made
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - Enhanced row `onClick` handling to automatically call `onMarkActivityRead(activity.id)` when the clicked activity has `isRead === false`.
  - Preserved existing click behavior by still calling `onActivityClick(activity)` for navigation.

- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx`:
  - Added test `marks unread activity as read when the row is clicked`.
  - Verifies that clicking an unread row calls both `onMarkActivityRead` and `onActivityClick`.

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
