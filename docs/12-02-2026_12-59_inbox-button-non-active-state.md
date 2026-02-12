# Keep page active state when Inbox popup is open

**Date:** 12-02-2026 12:59

## What changed
- Updated sidebar primary action highlighting so `Inbox` is treated like a popup trigger, not a navigational page.
- Removed Inbox-driven active overrides:
  - `Tasks` and `Archive` now keep their normal active behavior based on `currentView`.
  - `Inbox` button no longer receives `isActive`.
- Removed the now-unneeded `isInboxOpen` prop from sidebar action prop types and sidebar prop plumbing.

## Files updated
- `src/app/components/sidebar/SidebarPrimaryActions.tsx`
- `src/app/components/sidebar/types.ts`
- `src/app/components/Sidebar.tsx`
- `src/app/components/Sidebar.test.tsx`
- `src/app/dashboard/components/DashboardChrome.tsx`

## Validation
- `npx vitest run src/app/components/Sidebar.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarPrimaryActions.tsx src/app/components/sidebar/types.ts src/app/components/Sidebar.tsx src/app/components/Sidebar.test.tsx src/app/dashboard/components/DashboardChrome.tsx` ✅
