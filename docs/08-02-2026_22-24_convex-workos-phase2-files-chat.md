# Convex + WorkOS Plan Execution Continued (Phase 2: File Metadata + Chat Persistence)

## Scope Executed
Continued execution of `/Users/nick/Designagency/docs/08-02-2026_21-12_convex-workos-integration-plan.md` by implementing the phase-2 backend and frontend migration for:
- persisted project file metadata
- persisted project chat threads/replies/reactions

## Backend Changes

### 1. Schema extension
Updated `/Users/nick/Designagency/convex/schema.ts` with new tables:
- `projectFiles`
  - `workspaceId`, `projectId`, `projectPublicId`, `tab`, `name`, `type`, `displayDate`, `thumbnailRef`, `source`, timestamps
  - indexes for workspace/project lookups and tab filtering
- `projectComments`
  - threaded comments via optional `parentCommentId`
  - `resolved`, `edited`, `authorUserId`, timestamps
  - indexes for project, parent, workspace, author
- `commentReactions`
  - `commentId`, `emoji`, `userId`, `createdAt`
  - indexes including `by_comment_emoji_user` for reaction toggle semantics

Also added `fileTabValidator` in `/Users/nick/Designagency/convex/lib/validators.ts`.

### 2. File metadata API
Added `/Users/nick/Designagency/convex/files.ts`:
- `listForWorkspace`
- `listForProject`
- `create`
- `remove`

All endpoints enforce workspace membership.

### 3. Chat persistence API
Added `/Users/nick/Designagency/convex/comments.ts`:
- `listForProject` (threaded tree + grouped reactions + relative timestamp formatting)
- `create` (top-level or reply)
- `update` (author-only)
- `remove` (author-only, recursive delete with reaction cleanup)
- `toggleResolved`
- `toggleReaction`

### 4. Project attachment compatibility + cascade cleanup
Updated `/Users/nick/Designagency/convex/projects.ts`:
- Added attachment-to-`projectFiles` sync for create/update flows so existing draft/project attachment paths continue to populate the new persisted file metadata layer.
- Extended project delete cleanup to remove:
  - tasks
  - project files
  - project comments
  - comment reactions

## Frontend Changes

### 1. App-level wiring
Updated `/Users/nick/Designagency/src/app/App.tsx`:
- Added workspace file query: `api.files.listForWorkspace`
- Added file mutations:
  - `api.files.create`
  - `api.files.remove`
- Added mapping/grouping of workspace files by `projectPublicId`
- Passed persisted file data + handlers into `MainContent`
- Passed persisted file list into `SearchPopup`

### 2. Main project page file panel migration
Updated `/Users/nick/Designagency/src/app/components/MainContent.tsx`:
- Removed local static file arrays (`ASSET_FILES`, `CONTRACT_FILES`, `ATTACHMENT_FILES`) and local-only add/remove state mutations.
- Added props-based persisted file flow:
  - `projectFiles`
  - `onCreateFile`
  - `onRemoveFile`
- Kept tab/search/sort/highlight UX while sourcing data from Convex metadata.
- Added deterministic thumbnail fallback mapping by file type.

### 3. Search migration
Updated `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`:
- Replaced static/local file aggregation with Convex-provided persisted `files` prop from `App`.
- File search now navigates/highlights against persisted metadata only.

### 4. Chat sidebar migration
Updated `/Users/nick/Designagency/src/app/components/ChatSidebar.tsx`:
- Replaced local mock-thread state with Convex query/mutations:
  - `api.comments.listForProject`
  - `api.comments.create`
  - `api.comments.update`
  - `api.comments.remove`
  - `api.comments.toggleResolved`
  - `api.comments.toggleReaction`
- Preserved existing UX features:
  - thread/reply structure
  - edit/delete own comment
  - resolve/unresolve thread
  - reaction toggles
  - mention behavior
- Added dynamic current-user identity from WorkOS auth context for ownership/reaction state.

### 5. Type additions
Updated `/Users/nick/Designagency/src/app/types.ts`:
- Added `ProjectFileTab`
- Added `ProjectFileData`

## Validation Executed
All commands completed successfully:
- `npx convex codegen --typecheck disable`
- `npx convex codegen`
- `npm run build`

## Result
The plan execution now includes persisted phase-2 file metadata and chat persistence on Convex, replacing remaining local-only file/search/chat behavior in the active project workflow.

## Next steps
- Continue the remaining plan item: strict WorkOS org-to-workspace enforcement and reconciliation path (phase-2 org hardening).
- Run lint and typechecks