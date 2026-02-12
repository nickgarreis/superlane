# Inbox activity mentions, action UX, and per-user dismiss

## Date
- 12-02-2026 16:24

## Goal
Implement inbox-only mention navigation, improved activity copy, tokenized icon action UX, and per-user inbox dismiss without deleting global activity history.

## What changed
- Backend
  - Updated `/Users/nick/Designagency/convex/schema.ts`:
    - added `workspaceActivityDismissals` table
    - added indexes `by_workspace_user_activityEvent` and `by_workspace_user`
  - Updated `/Users/nick/Designagency/convex/activities.ts`:
    - added dismissal lookup helper for workspace/user/event sets
    - filtered dismissed events out of `listForWorkspace`
    - added `dismissActivity({ workspaceSlug, activityEventId })` mutation
    - made `dismissActivity` idempotent and unread-count aware
    - guarded `markActivityRead` against dismissed events to avoid double unread decrements

- Dashboard wiring
  - Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.ts`:
    - added `dismissActivityMutation`
  - Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`:
    - added `handleDismissInboxActivity`
  - Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`:
    - forwarded `handleDismissInboxActivity` to chrome props
  - Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.tsx`:
    - added `onDismissInboxActivity` prop and passed it to inbox panel

- Inbox behavior and activity rows
  - Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
    - removed row-level navigation in inbox path
    - wired mention click to mark-read (if unread) + existing activity navigation callback
    - wired per-row dismiss callback
  - Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
    - title now supports `ReactNode`
    - mark-read action uses tokenized filled icon button + success hover variant
    - added dismiss action (trash icon) using tokenized filled icon button + danger hover variant
  - Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
    - added reusable filled icon button token classes and success/danger hover variants
  - Added `/Users/nick/Designagency/src/app/components/activities-page/activityMentions.ts`:
    - mention label sanitization and mention token builder
  - Updated row renderers for copy refresh and inbox mention mode (plain mode preserved):
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

- Tests
  - Updated `/Users/nick/Designagency/convex/__tests__/activities_read_state.test.ts`:
    - added per-user dismiss visibility/unread/idempotency coverage
  - Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx`:
    - row container click no longer navigates
    - mention click triggers mark-read + navigation callback
    - dismiss button triggers dismiss callback
  - Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.test.tsx`:
    - verifies dismiss callback forwarding to inbox panel
  - Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
    - refreshed copy assertions
    - added mention-mode click/readability coverage

## Behavior changes
- Inbox navigation is mention-driven instead of row-click driven.
- Users can dismiss individual inbox activity rows for themselves.
- Dismissed events remain in workspace audit history and are still visible to other users.
- Dismissing an unread event decrements only the acting user’s unread count.
- Mark-read and dismiss actions now use filled icon-only tokenized UI treatments.

## Validation
- `npx vitest run convex/__tests__/activities_read_state.test.ts` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx eslint convex/schema.ts convex/activities.ts convex/__tests__/activities_read_state.test.ts src/app/components/InboxSidebarPanel.tsx src/app/components/InboxSidebarPanel.test.tsx src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/activityMentions.ts src/app/components/activities-page/rows/ProjectActivityRow.tsx src/app/components/activities-page/rows/TaskActivityRow.tsx src/app/components/activities-page/rows/FileActivityRow.tsx src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/MembershipActivityRow.tsx src/app/components/activities-page/rows/WorkspaceActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/ui/controlChrome.ts src/app/dashboard/components/DashboardChrome.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/dashboard/hooks/useDashboardApiHandlers.ts src/app/dashboard/hooks/useDashboardDataLayer.ts src/app/dashboard/hooks/useDashboardViewBindings.ts` ✅
- `npm run typecheck` ✅
