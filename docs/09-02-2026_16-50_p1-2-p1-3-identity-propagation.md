# P1.2 + P1.3 Identity Propagation and Creator Attribution

## Summary
Implemented the combined P1.2 + P1.3 stream:
- Replaced mock/static member identity usage across collaboration surfaces.
- Added a dedicated collaboration members query for workspace-scoped identity data.
- Updated comment contracts to include stable user IDs for authors/reactions.
- Updated dashboard snapshot to return creator identity per project.
- Removed creator fallback-to-viewer mapping logic in frontend project mapping.

## Backend Changes

### New collaboration read model
- Added `convex/collaboration.ts`:
  - `listWorkspaceMembers({ workspaceSlug })`
  - Authz via `requireWorkspaceRole(..., "member")`
  - Returns active members only with:
    - `userId`, `workosUserId`, `name`, `email`, `avatarUrl`, `role`, `isViewer`
  - Avatar resolution prefers storage URL (`avatarStorageId`) over persisted `avatarUrl`.
  - Sort order: viewer first, then alphabetical by member name.

### Comments identity contract hardening
- Updated `convex/comments.ts` `listForProject` payload:
  - Added `author.userId`.
  - Added `reactions[].userIds` alongside existing display names (`users`).

### Dashboard creator attribution
- Updated `convex/dashboard.ts` snapshot payload:
  - Each project now includes `creator` payload sourced from `creatorUserId`:
    - `creator: { userId, name, avatarUrl }`

## Frontend Changes

### Shared types and mapping
- Updated `src/app/types.ts`:
  - Added `WorkspaceRole`, `WorkspaceMember`, `ViewerIdentity`.
  - Added collaboration comment/reaction types with ID support.
  - Extended project creator type with optional `userId`.
- Updated `src/app/lib/mappers.ts`:
  - Uses backend project `creator` payload.
  - Removed viewer fallback creator injection parameters.

### App orchestration
- Updated `src/app/App.tsx`:
  - Added `useQuery(api.collaboration.listWorkspaceMembers, { workspaceSlug })`.
  - Derived centralized `viewerIdentity` and `workspaceMembers` from backend data.
  - Passed identity/member props into `Tasks`, `MainContent`, and `Sidebar`.
  - Kept task assignee persistence shape unchanged (`{ name, avatar }`).

### Collaboration surfaces
- Updated `src/app/components/ProjectTasks.tsx`:
  - Removed hardcoded member list.
  - Uses `assignableMembers` prop for assignee selection.
  - Preserves legacy/orphan assignee display on existing tasks.
  - New tasks default assignee uses real member/viewer identity.
- Updated `src/app/components/ChatSidebar.tsx`:
  - Removed mock workspace members and AuthKit user dependency for identity.
  - Mentions now sourced from active `workspaceMembers` only.
  - Mention meta displays normalized role label.
  - Own-comment and active-reaction checks now use user IDs.
- Updated `src/app/components/Sidebar.tsx`:
  - Replaced hardcoded footer profile identity with real `viewerIdentity`.
- Updated `src/app/components/MainContent.tsx` and `src/app/components/Tasks.tsx`:
  - Threaded member/viewer identity props into `ProjectTasks` and `ChatSidebar`.

## Tests
- Added `convex/__tests__/collaboration_identity.test.ts` covering:
  - `listWorkspaceMembers` active-members filtering and viewer-first sorting.
  - Avatar precedence (`avatarStorageId` over fallback `avatarUrl`).
  - Membership auth enforcement for members query.
  - Presence of `author.userId` and `reactions[].userIds` in comments payload.
  - Presence of project `creator` identity payload in dashboard snapshot.

## Validation
Executed successfully:
- `npm run lint`
- `npm run typecheck`
- `npm run test:rbac`
- `npm run build`
