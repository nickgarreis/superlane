# Inbox sidebar animation origin fix

**Date:** 12-02-2026 12:48

## What changed
- Updated inbox panel open/close animation to originate from the sidebar’s right edge.
- Replaced translation-based motion (`x`) with width-based reveal/collapse on the outer container:
  - `initial: { width: 0, opacity: 0 }`
  - `animate: { width: 420, opacity: 1 }`
  - `exit: { width: 0, opacity: 0 }`
- Kept a fixed-width inner panel (`w-[420px]`) so content/layout remain unchanged while the container animates from the edge.

## Files updated
- `src/app/components/InboxSidebarPanel.tsx`

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx` ✅
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
