# Inbox header: move Mark all as read closer to Close button

## Date
- 13-02-2026 10:00

## Goal
Bring the inbox header `Mark all as read` button closer to the top-right close (`X`) button.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - changed the button right margin class from `mr-12` to `mr-8` on the `Mark all as read` button.
  - this reduces the horizontal gap to the close button while keeping the existing header layout and interactions intact.

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
