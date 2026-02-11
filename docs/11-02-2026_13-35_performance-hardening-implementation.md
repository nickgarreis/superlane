# Performance Hardening Implementation (In Progress)

**Date:** 11-02-2026 13:35

## Summary
Started implementation of the performance hardening plan across frontend and Convex backend with focus on chunk-splitting fixes, dashboard render fanout reduction groundwork, and backend N+1 mitigation scaffolding.

## What Changed So Far

### Phase 1 — Code-splitting
- Updated `/Users/nick/Designagency/src/app/components/CompletedProjectDetailPopup.tsx`:
  - Replaced static `MainContent` import with `React.lazy` + `Suspense`.
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`:
  - Added lazy loaders for:
    - `CompletedProjectsPopup`
    - `CompletedProjectDetailPopup`
  - Wrapped completed-project popup render path in suspense boundaries.

### Phase 2 — Dashboard data fanout groundwork
- Updated `/Users/nick/Designagency/src/app/lib/mappers.ts`:
  - Removed task embedding from `mapProjectsToUi`.
  - Added `mapTasksByProjectToUi`.
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Added `projectsById`, `tasksByProject`, and `visibleProjectIds` outputs.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardTaskSync.ts` and `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`:
  - Switched project task sync source from `projects[projectId].tasks` to `tasksByProject`.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Wired `tasksByProject` into project actions.
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardContent.tsx`:
  - Accepts `tasksByProject` and passes `projectTasks` to `MainContent`.
- Updated `/Users/nick/Designagency/src/app/components/MainContent.tsx`:
  - Accepts `projectTasks` prop and uses it for tasks/highlighting/chat.
- Updated `/Users/nick/Designagency/src/app/components/CompletedProjectDetailPopup.tsx`:
  - Added optional `projectTasks` prop.
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx` and `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`:
  - Threaded `workspaceTasks` and `tasksByProject` through popup bindings.
  - Added conditional popup project payload narrowing in `useDashboardViewBindings`.
- Updated search pipeline:
  - `/Users/nick/Designagency/src/app/components/search-popup/types.ts`
  - `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/search-popup/useSearchPopupData.tsx`
  - `/Users/nick/Designagency/src/app/components/search-popup/searchIndex.ts`
  - Search now consumes workspace task list instead of `project.tasks` embedding.

### Phase 3 — Convex N+1 mitigation groundwork
- Updated `/Users/nick/Designagency/convex/lib/dashboardContext.ts`:
  - Batched org membership filtering using `workosOrganizationMemberships` by `workosUserId` instead of per-workspace lookup.
  - Improved member hydration to use snapshot fields first with fallback to user lookup.
  - Switched workspace member query path to indexed `by_workspace_status_joinedAt` where applicable.
- Updated `/Users/nick/Designagency/convex/schema.ts`:
  - Added optional `workspaceMembers` snapshot fields:
    - `nameSnapshot`
    - `emailSnapshot`
    - `avatarUrlSnapshot`
- Updated `/Users/nick/Designagency/convex/workspaces.ts` and `/Users/nick/Designagency/convex/lib/workosOrganization.ts`:
  - Populate membership snapshot fields on insert/update.
- Updated `/Users/nick/Designagency/convex/settings.ts`:
  - Reworked membership mapping to prefer snapshot fields.
  - Added helper to patch workspace-member snapshots for user profile/avatar updates.
  - Applied snapshot syncing in avatar/profile update paths.
- Updated `/Users/nick/Designagency/convex/collaboration.ts`:
  - Added `listWorkspaceMembersLite` query.
- Updated `/Users/nick/Designagency/convex/performanceBackfills.ts`:
  - Added `backfillWorkspaceMemberSnapshots` mutation.
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Added usage of `api.collaboration.listWorkspaceMembersLite` for lightweight viewer role derivation.

### Phase 4 — Comments pagination groundwork
- Updated `/Users/nick/Designagency/convex/comments.ts`:
  - Added `listThreadsPaginated`.
  - Added `listReplies`.
  - Kept `listForProject` as legacy endpoint.
- Updated `/Users/nick/Designagency/src/app/types.ts`:
  - Extended `CollaborationComment` with `timestampEpochMs` and `replyCount`.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarView.tsx`:
  - Added optional `onCommentsScroll` hook prop.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.tsx`:
  - Began switching to paginated thread loading (`usePaginatedQuery`) and lazy reply loading.
  - Added client-side relative timestamp formatter.

## Status
- Implementation is still in progress. Validation and remaining wiring/tests are pending.
