# Inbox mention click closes panel

## Date
- 12-02-2026 17:05

## Goal
Close the inbox panel when a user clicks a mention inside an inbox activity record.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - extended `RenderInboxActivityArgs` with `onClose`
  - updated mention click handler to call `args.onClose?.()` after `onActivityClick`
  - passed `onClose` through the `renderInboxActivity` mapping and updated memo dependencies
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx`:
  - strengthened mention-click test to assert `onClose` is called once
  - renamed the test to reflect close behavior

## Behavior change
- Clicking a mention in an inbox activity now:
  - marks the activity as read (if unread)
  - triggers the activity navigation callback
  - closes the inbox panel

## Validation
- `npx eslint src/app/components/InboxSidebarPanel.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
