# Inbox read/unread tracking with exact unread badge count

**Date:** 12-02-2026 13:22

## What changed
- Added persistent per-user inbox read-state tracking in Convex:
  - `workspaces.activityEventCount` (exact historical event counter)
  - `workspaceActivityInboxStates` (per-user unread count + mark-all cutoff)
  - `workspaceActivityReadReceipts` (per-event read receipts)
- Extended activity event logging to:
  - Maintain `activityEventCount` exactly
  - Increment unread counters for all active workspace members
  - Initialize missing member inbox states with full historical unread count
- Extended `convex/activities.ts` with inbox read APIs:
  - `getUnreadSummary` query
  - `markActivityRead` mutation (idempotent)
  - `markAllRead` mutation
  - `listForWorkspace` now returns `isRead` on each activity
- Added backend read-state coverage in:
  - `convex/__tests__/activities_read_state.test.ts`
- Wired unread data and read mutations through dashboard hooks:
  - `useDashboardData` now queries unread summary and exposes `inboxUnreadCount`
  - `useDashboardApiHandlers` now exposes `markActivityReadMutation` and `markAllReadMutation`
  - `useDashboardDataLayer` now provides `handleMarkInboxActivityRead` and `handleMarkAllInboxActivitiesRead`
- Updated sidebar inbox button to show unread badge count (`99+` cap) when unread > 0.
- Updated inbox panel UI:
  - Added per-row unread styling + `Mark read`
  - Added header `Mark all as read`
  - Added unread summary badge in panel header
  - Preserved row click navigation behavior via optional `onActivityClick`
- Updated/expanded frontend tests for unread behavior and new prop plumbing:
  - `InboxSidebarPanel.test.tsx`
  - `Sidebar.test.tsx`
  - `DashboardChrome.test.tsx`
  - `useDashboardApiHandlers.test.tsx`
  - `useDashboardData.test.tsx`

## Files updated (this change)
- `convex/schema.ts`
- `convex/lib/activityEvents.ts`
- `convex/activities.ts`
- `convex/__tests__/activities_read_state.test.ts`
- `src/app/types.ts`
- `src/app/components/Sidebar.tsx`
- `src/app/components/Sidebar.test.tsx`
- `src/app/components/InboxSidebarPanel.tsx`
- `src/app/components/InboxSidebarPanel.test.tsx`
- `src/app/components/sidebar/types.ts`
- `src/app/components/sidebar/SidebarPrimaryActions.tsx`
- `src/app/components/activities-page/ActivityRowShell.tsx`
- `src/app/components/activities-page/rows/ProjectActivityRow.tsx`
- `src/app/components/activities-page/rows/TaskActivityRow.tsx`
- `src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
- `src/app/components/activities-page/rows/FileActivityRow.tsx`
- `src/app/components/activities-page/rows/MembershipActivityRow.tsx`
- `src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`
- `src/app/dashboard/useDashboardData.ts`
- `src/app/dashboard/useDashboardData.types.ts`
- `src/app/dashboard/useDashboardData.test.tsx`
- `src/app/dashboard/lib/uploadHelpers.ts`
- `src/app/dashboard/hooks/useDashboardApiHandlers.ts`
- `src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx`
- `src/app/dashboard/hooks/useDashboardDataLayer.ts`
- `src/app/dashboard/hooks/useDashboardViewBindings.ts`
- `src/app/dashboard/components/DashboardChrome.tsx`
- `src/app/dashboard/components/DashboardChrome.test.tsx`
- `src/app/dashboard/hooks/useDashboardInboxActivityNavigation.ts` (lint dependency cleanup)

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:backend` ✅
- `npm run test:frontend` ✅
- Focused regression subset:
  - `npx vitest run convex/__tests__/activities_read_state.test.ts src/app/components/InboxSidebarPanel.test.tsx src/app/components/Sidebar.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx src/app/dashboard/useDashboardData.test.tsx` ✅
