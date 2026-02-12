# Match Inbox panel shadow to comments sidebar

**Date:** 12-02-2026 12:50

## What changed
- Updated inbox sidebar panel shadow placement to match the comments component.
- Moved `shadow-2xl` (with `bg` and `border-l`) onto the animated outer shell, mirroring `ChatSidebarView`.
- Removed duplicate shadow/border/bg from the fixed-width inner wrapper to avoid clipping artifacts during width animation.

## Files updated
- `src/app/components/InboxSidebarPanel.tsx`

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx` ✅
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
