# Reply Count, Thread Deletion, and Tasks UI Cleanup

**Date:** 11-02-2026 18:48

## What changed
- Updated `convex/comments.ts` reply create flow to avoid read-then-write against `parent.replyCount`.
  - After inserting a reply, parent `replyCount` is now recomputed from `by_parentCommentId` children and patched from that authoritative count.
  - Added an inline note documenting the tradeoff: no atomic increment operator in Convex patch values, so recount is used to avoid read-modify-write race behavior.
- Updated `convex/comments.ts` `deleteCommentThread` to iterative traversal.
  - Replaced recursion with an explicit stack-based traversal that collects the initial comment and all descendants.
  - Preserves flattened `ProjectCommentDoc[]` return shape.
- Removed unused `isSidebarOpen` prop from `Tasks` container API.
  - Updated `src/app/components/Tasks.tsx` props/destructuring.
  - Updated `src/app/dashboard/components/DashboardContent.tsx` `LazyTasks` call site.
  - Updated `src/app/components/Tasks.test.tsx` render props.
- Updated Add Task button styling in `src/app/components/tasks-page/TasksView.tsx`.
  - Removed redundant `hover:txt-tone-accent` class so hover state is not a no-op declaration.

## Validation
- Ran `npm run test:backend -- convex/__tests__/comments_and_pending_uploads.test.ts`.
  - Result: pass.
- Ran `npm run test:frontend -- src/app/components/Tasks.test.tsx`.
  - Result: pass.
