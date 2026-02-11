# Performance Remediation (Phases 1-4)

**Date:** 11-02-2026 22:31

## Scope
Implemented the requested React + Convex performance remediation plan across schema, backend query/mutation hot paths, frontend task sync behavior, and chat sidebar reply update flow.

## Changes

### 1) Comment thread pagination + payload improvements
- Updated `/Users/nick/Designagency/convex/schema.ts`:
  - Added `projectComments` index:
    - `by_projectPublicId_parentCommentId_createdAt = ["projectPublicId", "parentCommentId", "createdAt"]`
- Updated `/Users/nick/Designagency/convex/comments.ts`:
  - Replaced thread pagination filter-loop with direct indexed parent-thread pagination in `listThreadsPaginated`.
  - Removed legacy `paginateCommentsWithFilter` path from thread listing.
  - Added `incrementParentReplyCount(...)` helper with retry-first snapshot increment and fallback exact recount.
  - `comments.update` now returns additive field `updatedAtEpochMs`.
  - `comments.remove` now returns additive fields `removedCommentId` and `parentCommentId`.
  - `comments.toggleReaction` now returns additive field `reactionSummary` (emoji + users + userIds).

### 2) Task diff hot-path refactor
- Updated `/Users/nick/Designagency/convex/lib/taskDiffMutation.ts`:
  - Removed workspace-wide task scan from normal create/update/remove flow.
  - Replaced with targeted `by_workspace_taskId` lookups for only referenced ids.
  - Kept `orderedTaskIds` compatibility path and explicitly marked it as legacy full-scan path.
  - Added audit counters to return payload:
    - `processedTaskIds`
    - `usedFullScan`
    - `durationMs`
  - Kept existing return fields (`created`, `updated`, `removed`, `reordered`).

### 3) Frontend task sync split (`applyDiff` + `reorder`)
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardTaskSync.ts`:
  - `applyDiff` now handles creates/updates/removes only.
  - Reorder now runs as separate call via `tasks.reorder` when order changed.
- Updated wiring:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`

### 4) Chat sidebar round-trip reduction
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/useChatSidebarCommentActions.ts`:
  - Added optional local-update callbacks for resolve/edit/delete/reaction mutations.
  - Stopped unconditional forced reply refetch after these actions.
  - Fallback refresh runs only when local handling is not possible.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.tsx`:
  - Added local reply-cache patch helpers for resolve/edit/delete/reaction updates.
  - Applied deterministic cache updates for reply mutations using additive mutation payload fields.

### 5) Workspace/member hydration scalability hardening
- Updated `/Users/nick/Designagency/convex/lib/dashboardContext.ts`:
  - Deduplicated workspace ids before workspace `db.get` hydration.
  - Added avatar URL cache in workspace member hydration to avoid repeated avatar resolution work.
  - Preserved role/access semantics and fallback behavior.

### 6) Additional type-safety fix
- Updated `/Users/nick/Designagency/convex/tasks.ts`:
  - Fixed `TS2769` reduce typing in `tasks.reorder` by using a typed numeric reducer.

## Tests and Validation
- Backend tests:
  - `npm run test:backend -- convex/__tests__/tasks_apply_diff.test.ts convex/__tests__/comments_and_pending_uploads.test.ts` ✅
  - (full backend suite also ran in this command invocation context and passed)
- Frontend tests:
  - `npm run test:frontend -- src/app/dashboard/hooks/useDashboardProjectActions.test.tsx src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.test.tsx src/app/dashboard/useDashboardOrchestration.test.tsx` ✅
  - (full frontend suite also ran in this command invocation context and passed)
- Typecheck:
  - `npm run typecheck` ✅
- Lint:
  - `npm run lint` ✅
- Build:
  - `npm run build` ✅
- Performance budgets:
  - `npm run perf:report` ✅

## Notes
- Existing pre-run untracked docs file remained untouched:
  - `/Users/nick/Designagency/docs/11-02-2026_22-16_sidebar-project-list-stability.md`
