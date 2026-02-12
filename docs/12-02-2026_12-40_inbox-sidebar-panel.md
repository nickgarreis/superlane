# Rename Activities entry to Inbox and move it to sidebar slide-in panel

**Date:** 12-02-2026 12:40

## What changed
- Replaced the sidebar primary action label from `Activities` to `Inbox`.
- Added inbox panel state to dashboard navigation (`openInbox`, `closeInbox`, `isInboxOpen`) and ensured route navigation closes the inbox panel.
- Built a new slide-in sidebar panel component at `src/app/components/InboxSidebarPanel.tsx`:
  - Uses the existing activity row renderers.
  - Includes search + type filter + infinite-scroll loading.
  - Uses comments-like slide-in motion and close button UX.
- Wired the panel into `DashboardChrome` so it lives beside the left sidebar and opens via the new Inbox button.
- Updated Search quick action from `Go to Activities` to `Open Inbox`, and wired it to open the sidebar panel instead of navigating to the Activities page.
- Added an explicit `/activities` route redirect to `/tasks` in `App.tsx` so the old full-page Activities route is no longer reachable through top-level routing.
- Added and updated tests for inbox panel behavior and new wiring.

## Files updated
- `src/app/App.tsx`
- `src/app/components/SearchPopup.tsx`
- `src/app/components/SearchPopup.test.tsx`
- `src/app/components/Sidebar.tsx`
- `src/app/components/Sidebar.test.tsx`
- `src/app/components/search-popup/types.ts`
- `src/app/components/search-popup/useSearchPopupData.tsx`
- `src/app/components/search-popup/useSearchPopupData.test.tsx`
- `src/app/components/sidebar/SidebarPrimaryActions.tsx`
- `src/app/components/sidebar/types.ts`
- `src/app/components/InboxSidebarPanel.tsx`
- `src/app/components/InboxSidebarPanel.test.tsx`
- `src/app/dashboard/components/DashboardChrome.tsx`
- `src/app/dashboard/components/DashboardChrome.test.tsx`
- `src/app/dashboard/components/DashboardPopups.tsx`
- `src/app/dashboard/components/DashboardPopups.test.tsx`
- `src/app/dashboard/components/dashboardPopups.types.ts`
- `src/app/dashboard/hooks/useDashboardViewBindings.ts`
- `src/app/dashboard/useDashboardNavigation.ts`
- `src/app/dashboard/useDashboardNavigation.test.tsx`

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/components/SearchPopup.test.tsx src/app/components/search-popup/useSearchPopupData.test.tsx src/app/components/Sidebar.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/dashboard/components/DashboardPopups.test.tsx src/app/dashboard/useDashboardNavigation.test.tsx` ✅
- `npm run test:frontend` ✅
- `npx eslint src/app/App.tsx src/app/components/SearchPopup.tsx src/app/components/SearchPopup.test.tsx src/app/components/Sidebar.tsx src/app/components/Sidebar.test.tsx src/app/components/search-popup/types.ts src/app/components/search-popup/useSearchPopupData.tsx src/app/components/search-popup/useSearchPopupData.test.tsx src/app/components/sidebar/SidebarPrimaryActions.tsx src/app/components/sidebar/types.ts src/app/dashboard/components/DashboardChrome.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/dashboard/components/DashboardPopups.tsx src/app/dashboard/components/DashboardPopups.test.tsx src/app/dashboard/components/dashboardPopups.types.ts src/app/dashboard/hooks/useDashboardViewBindings.ts src/app/dashboard/useDashboardNavigation.ts src/app/dashboard/useDashboardNavigation.test.tsx src/app/components/InboxSidebarPanel.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npm run typecheck` ⚠️ fails due pre-existing frontend type errors in `src/app/components/activities-page/rows/TaskActivityRow.tsx` (`number | null` passed where `number` is required).
