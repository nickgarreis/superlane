# Comments dropdown scope + completed comments history

## Date
- 13-02-2026 13:10

## Goal
- Restrict comments-panel project dropdown to active and archived projects.
- Render archived projects with a shared `SidebarTag` archived tone using grey design tokens.
- Add read-only threaded comments history to completed project detail (after tasks, before files) with a dedicated backend query.

## What changed
- Added `comments.listHistoryForProject` in `/Users/nick/Designagency/convex/comments.ts`.
  - Enforces `requireProjectRole(..., "member")`.
  - Returns threaded, read-only history rows with `id`, `parentCommentId`, `author`, `content`, `createdAtEpochMs`, `resolved`, `edited`, `reactions`, and `replies`.
  - Ordering: top-level newest-first; replies oldest-first.
- Added backend coverage in `/Users/nick/Designagency/convex/__tests__/comments_and_pending_uploads.test.ts`.
  - Covers member access, non-member denial, ordering, resolved + reaction metadata.
- Extended `SidebarTag` tone system in `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`.
  - Added `"archived"` tone using:
    - `[color:var(--text-muted-medium)]`
    - `[background-color:var(--surface-muted-soft)]`
    - `[border-color:var(--border-soft)]`
- Updated comments dropdown behavior:
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.tsx`
    - Filters to Active + Archived only.
    - Sorts Active first, Archived second, then by name.
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ProjectDropdown.tsx`
    - Uses `<SidebarTag tone="archived">Archived</SidebarTag>`.
    - Archived selection routes to `archive-project:{id}`; active routes to `project:{id}`.
- Added archived-inclusive chat project data path:
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardData.types.ts`
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardContent.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/dashboardPopups.types.ts`
- Added completed comments history UI:
  - New component `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.tsx`.
  - Integrated in `/Users/nick/Designagency/src/app/components/MainContent.tsx` after tasks and before files.
  - Data loaded in `/Users/nick/Designagency/src/app/components/CompletedProjectDetailPopup.tsx` via `api.comments.listHistoryForProject` and passed as optional props to `MainContent`.
- Added/updated frontend tests:
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx`
  - `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardContent.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardOrchestration.test.tsx`
- Refactored helper extraction to satisfy file-size gate:
  - Added `/Users/nick/Designagency/src/app/dashboard/useDashboardData.helpers.ts`.
  - Reduced `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts` to below 500 lines.

## Validation
- `npm run test:backend -- comments` ✅
- `npm run test:frontend -- src/app/components/chat-sidebar src/app/components/sidebar/SidebarTag.test.tsx src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx src/app/dashboard/useDashboardData.test.tsx src/app/dashboard/components/DashboardContent.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run lint` ⚠️ Fails on pre-existing repository gates unrelated to this change:
  - `src/app/dashboard/useDashboardNavigation.ts` (>500 lines)
  - `convex/activities.ts` (>500 lines)
