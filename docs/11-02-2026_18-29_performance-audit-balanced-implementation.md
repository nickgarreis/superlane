# Performance Audit Balanced Plan Implementation

**Date:** 11-02-2026 18:29

## Scope completed
Implemented the balanced remediation plan across backend and frontend performance paths, plus bundle-analysis tooling and chunk-splitting.

## Backend changes

### 1) Comment feed scalability and reply count denormalization
- Updated `/Users/nick/Designagency/convex/schema.ts`:
  - Added optional `replyCount` on `projectComments` for backward-compatible denormalized reply totals.
- Updated `/Users/nick/Designagency/convex/comments.ts`:
  - `create` now initializes `replyCount: 0` on new comments.
  - `create` now increments direct parent `replyCount` when creating a reply.
  - Replaced full-project reply counting in paginated endpoints with:
    - direct `replyCount` read when present,
    - targeted per-parent fallback query for legacy rows without snapshots.
  - Refactored thread deletion to collect subtree rows and decrement reply counts on surviving parents.
  - Isolated reaction-row collection behind dedicated helper with TODO for future aggregate materialization.
- Updated `/Users/nick/Designagency/convex/performanceBackfills.ts`:
  - Added `backfillProjectCommentReplyCounts` mutation for one-time replyCount backfill.

### 2) Membership query optimization and viewer role endpoint
- Updated `/Users/nick/Designagency/convex/collaboration.ts`:
  - `listWorkspaceMembers` now queries active rows directly via `by_workspace_status_joinedAt` (removed broad collect + filter).
  - Added `getViewerMembership` query returning `{ userId, role, isViewer }`.
  - Optimized lite-members fallback lookup to remove repeated membership scans.
- Updated `/Users/nick/Designagency/convex/lib/dashboardContext.ts`:
  - Removed `membershipRows.find(...)` inside hydration loop by introducing map lookup.

## Frontend changes

### 3) Dashboard membership subscription simplification
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Removed runtime dependency on `listWorkspaceMembersLite`.
  - Added `getViewerMembership` subscription for role derivation.
  - Viewer role now resolves from `getViewerMembership` first, then full members fallback.

### 4) Chat rerender reduction and component boundary refactor
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.tsx`:
  - Stabilized `loadRepliesForParent` by using a ref-backed reply cache read.
  - Extracted comment item rendering/virtualized list generation to separate hook.
- Added `/Users/nick/Designagency/src/app/components/chat-sidebar/useChatSidebarRenderItems.tsx`.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentItem.tsx`:
  - Added custom `React.memo` comparator keyed to per-comment active state (reply/edit/reaction/menu/collapse) to avoid list-wide rerender fanout.
- Added `/Users/nick/Designagency/src/app/components/chat-sidebar/chatSidebar.types.ts`.

### 5) Tasks and popups component splitting
- Rewrote `/Users/nick/Designagency/src/app/components/Tasks.tsx` as logic/container only.
- Added `/Users/nick/Designagency/src/app/components/tasks-page/TasksView.tsx` for presentational structure and controls.
- Split popup typing surface out of `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`.
- Added `/Users/nick/Designagency/src/app/dashboard/components/dashboardPopups.types.ts`.

## Bundle-analysis tooling and chunk strategy
- Updated `/Users/nick/Designagency/package.json`:
  - Added `build:analyze` script (`ANALYZE=true vite build`).
  - Added `rollup-plugin-visualizer` dev dependency.
- Updated `/Users/nick/Designagency/vite.config.ts`:
  - Added analyzer plugin output to `performance-reports/bundle-analysis.html` when `ANALYZE=true`.
  - Expanded manual chunking to isolate heavy vendor groups (`@tanstack`, dropzone, dnd-core/@react-dnd, motion-dom/motion-utils), reducing `vendor-misc` concentration.

## Tests and checks
- `npm run typecheck` ✅
- `npm run test:backend -- convex/__tests__/comments_and_pending_uploads.test.ts convex/__tests__/collaboration_identity.test.ts` ✅
- `npm run test:frontend -- src/app/components/Tasks.test.tsx src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx src/app/dashboard/components/DashboardPopups.test.tsx src/app/dashboard/useDashboardData.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.test.tsx src/app/dashboard/useDashboardOrchestration.test.tsx` ✅
- `npm test` ✅
- `npm run build` ✅
- `npm run perf:report` ✅
  - `vendor-misc` gzip reduced to ~20 KB.
- `npm run lint:checks` ⚠️
  - Targeted component-size warnings from this scope were resolved.
  - Fails on existing unrelated feature-size gate: `convex/devSeed.ts` (>500 lines).

## New/updated tests
- Updated `/Users/nick/Designagency/convex/__tests__/comments_and_pending_uploads.test.ts`:
  - added replyCount create/remove behavior coverage,
  - added replyCount backfill mutation coverage.
- Updated `/Users/nick/Designagency/convex/__tests__/collaboration_identity.test.ts`:
  - added `getViewerMembership` contract coverage.
