# Add right stroke to Inbox panel

**Date:** 12-02-2026 12:51

## What changed
- Added a right-edge stroke to the inbox sidebar panel shell.
- Updated the outer animated panel classes from `border-l` to `border-l border-r` using the existing `border-border-subtle-soft` token.

## Files updated
- `src/app/components/InboxSidebarPanel.tsx`

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx` ✅
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
