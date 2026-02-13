# Avatar-aware user mentions across inbox, comments, and mention UI

## Date
- 13-02-2026 10:12

## Goal
Implement avatar-aware user mention rendering across all mention surfaces while preserving compatibility with existing `@[user:label]` tokens.

## What changed
- Added shared mention avatar lookup utility:
  - `/Users/nick/Designagency/src/app/components/mentions/userAvatarLookup.ts`
  - normalizes labels (trim + collapse spaces + case-insensitive)
  - builds unique label-to-avatar map
  - suppresses avatar mapping when duplicate normalized labels exist

- Updated mention render/parsing pipeline to support user avatar lookups:
  - `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`
    - added optional `MentionRenderOptions` (`userAvatarByLabel`)
    - user mention badges now render `<img>` when a mapped avatar exists; fallback remains initials
  - `/Users/nick/Designagency/src/app/components/mentions/mentionParser.ts`
    - added optional `MentionHTMLRenderOptions`
    - `valueToHTML()` now renders avatar image for user mentions when lookup is available
  - `/Users/nick/Designagency/src/app/components/MentionTextarea.tsx`
    - builds user-avatar lookup from mention items
    - passes lookup to `valueToHTML()`
    - resyncs DOM mention visuals when mention item avatar data changes

- Updated mention dropdown avatar support:
  - `/Users/nick/Designagency/src/app/components/mentions/MentionDropdown.tsx`
    - user options render avatar images when provided, otherwise initials
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarPanel.tsx`
    - user mention items now include `avatar` from workspace members

- Updated comment mention display to use avatar-aware lookup:
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentItem.tsx`
    - builds mention avatar lookup from `mentionItems`
    - passes lookup into `renderCommentContent()`

- Updated inbox mention rendering path:
  - `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`
    - added `workspaceMembers` prop
    - builds workspace-member avatar lookup
    - passes avatar-aware mention render options per activity row
  - `/Users/nick/Designagency/src/app/components/activities-page/inboxMentionRender.ts`
    - extracted helper that merges workspace-member + activity actor/target avatar context
  - Activity row components now accept optional mention render options and forward them to mention rendering:
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`
    - `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

- Threaded new inbox prop through dashboard:
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`

- Fixed backend mention activity extraction and resolution:
  - `/Users/nick/Designagency/convex/comments.ts`
    - replaced legacy-only mention parsing with token-aware parsing for `@[user:Label]`
    - retained legacy `@handle` fallback parsing
    - resolves mention targets against active workspace members (name/email/local-part)
    - logs `mention_added` with best-effort `targetUserId` + `targetUserName`
  - `/Users/nick/Designagency/convex/activities.ts`
    - target mention avatar hydration now falls back to `avatarStorageId` URL when `avatarUrl` is missing

## Tests updated
- `/Users/nick/Designagency/src/app/components/MentionTextarea.test.tsx`
  - verifies user mention avatar rendering with lookup
  - verifies ambiguous labels fall back to initials
  - verifies user avatar appears in mention dropdown
- `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentItem.test.tsx`
  - verifies rendered user mention badge can display avatar
- `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx`
  - verifies inbox mention badge avatar resolves from workspace member lookup
- `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`
  - verifies collaboration/task/membership mention-mode avatars render when lookup provided
- `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.test.tsx`
  - updated fixtures for new `workspaceMembers` prop
- `/Users/nick/Designagency/convex/__tests__/comments_and_pending_uploads.test.ts`
  - verifies `@[user:...]` mention logs with resolved target user
  - verifies target avatar URL resolves via storage fallback
  - verifies ambiguous duplicate names keep `targetUserId` null

## Validation
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/chat-sidebar/CommentItem.test.tsx src/app/components/InboxSidebarPanel.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx convex/__tests__/comments_and_pending_uploads.test.ts` ✅
- `npm run typecheck` ✅
- `npm run lint` ⚠️ fails in repo-wide quality check due pre-existing feature-size gate failures:
  - `convex/activities.ts` (>500 lines)
  - `src/app/dashboard/useDashboardNavigation.ts` (>500 lines)
