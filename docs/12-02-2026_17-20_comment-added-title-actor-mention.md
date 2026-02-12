# Comment-added title includes actor mention

## Date
- 12-02-2026 17:20

## Goal
Update inbox collaboration activity copy so comment-added records render as `@{user} added a comment in @{project}` instead of `Added a comment in @{project}`.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`:
  - `comment_added` plain text now includes actor name: `{actor} added a comment in {project}`.
  - inbox mention-mode title now includes actor mention token + project mention token: `@[user:{actor}] added a comment in @[file:{project}]`.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - added coverage that inbox `comment_added` title renders the actor mention before the project mention.
  - verifies clicking actor mention resolves to `("user", actor)` and clicking project mention resolves to `("file", project)`.

## Behavior change
- Collaboration `comment_added` activity titles now explicitly identify who added the comment.
- In inbox mention mode, both actor and project are rendered as clickable mention badges using the shared mention renderer style.

## Validation
- `npx eslint src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
