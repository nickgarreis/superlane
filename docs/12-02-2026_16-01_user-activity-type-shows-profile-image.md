# User activity type shows profile image

## Date
- 12-02-2026 16:01

## Goal
Display user activities with the user's profile image in the activity type slot.

## Root cause
Activity type icons were mapped by kind only, so membership/user activities used the generic `User` icon and had no avatar payload available in the activity feed.

## What changed
- Updated `/Users/nick/Designagency/convex/activities.ts`:
  - enriched `listForWorkspace` response with `targetUserAvatarUrl`
  - resolved avatar URLs by collecting `targetUserId`s from the page, querying `users`, and mapping non-empty `avatarUrl`

- Updated `/Users/nick/Designagency/src/app/types.ts`:
  - added optional `targetUserAvatarUrl?: string | null` to `WorkspaceActivity`

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`:
  - membership rows now pass a custom `kindIcon` to `ActivityRowShell`
  - renders user profile image when `targetUserAvatarUrl` exists
  - falls back to an initial-based circular badge when avatar is unavailable

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - test fixture now supports `targetUserAvatarUrl`
  - added test coverage asserting profile-image rendering in membership activity type icon

## Validation
- `npx eslint src/app/components/activities-page/rows/MembershipActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/types.ts convex/activities.ts` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npm run typecheck` ✅
