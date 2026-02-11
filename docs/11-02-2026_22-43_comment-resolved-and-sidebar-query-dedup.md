# Comment resolved state safety and sidebar query dedup

**Date:** 11-02-2026 22:43

## What changed
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/useChatSidebarCommentActions.ts`:
  - Changed `onCommentResolved` callback args to `resolved?: boolean | undefined`.
  - Added typed mutation result handling for `toggleResolvedMutation` via `ToggleResolvedMutationResult`.
  - In `handleResolve`, now passes `resolved` to `onCommentResolved` only when `result?.resolved` is a boolean; otherwise omits the field.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.tsx`:
  - Updated `handleLocalResolveUpdate` signature to accept optional `resolved`.
  - Returns `false` when resolved state is unknown so the caller falls back to a refresh instead of applying an incorrect local patch.
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Changed `sidebarProjectsResult` query args to `"skip"` when `shouldIncludeArchivedProjects` is `false`.
  - Added `sidebarProjectsSource` fallback logic:
    - Uses `paginatedProjects` when archived projects are not included (avoids duplicate project API call).
    - Uses `paginatedSidebarProjects` when archived projects are included (keeps sidebar stable while archive/search route query churns).
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`:
  - Adjusted expectations for the skipped sidebar query when archived projects are not needed.
  - Updated includeArchived argument tracking assertions to reflect single includeArchived query per render in non-archive contexts.

## Why
- Prevents incorrect optimistic local resolve state when mutation responses do not include a boolean `resolved` field.
- Removes redundant `api.projects.listForWorkspace` call in non-archive contexts while preserving stable hook order and sidebar behavior across tasks/archive transitions.

## Validation
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx` ✅
- `npm run typecheck` ✅
- `npx eslint src/app/components/chat-sidebar/useChatSidebarCommentActions.ts src/app/components/chat-sidebar/ChatSidebarPanel.tsx src/app/dashboard/useDashboardData.ts src/app/dashboard/useDashboardData.test.tsx` ✅
