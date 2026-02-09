# Comment Ownership Hardening (Review + Collaboration)

**Date:** 2026-02-09 20:19  
**Type:** Access Control / Authorization Hardening

## Summary

Fixed comment authorization so users can only edit or remove their own comments across both comment systems:

1. **Project collaboration comments** (`projectComments` table)
2. **Review-page comments** (`projects.reviewComments` field used in "Your Project is in Review")

## Backend Changes

### `convex/comments.ts`
- Removed admin override for edit/delete operations.
- `comments.update` now allows updates only when `comment.authorUserId === appUser._id`.
- `comments.remove` now allows removals only when `comment.authorUserId === appUser._id`.

### `convex/projects.ts`
- Added ownership enforcement helper for `reviewComments` updates.
- Enforced rules:
  - Existing comments authored by another user cannot be modified.
  - Existing comments authored by another user cannot be deleted.
  - New comments cannot be created as another user.
- Applied these checks to both mutation paths:
  - `projects.updateReviewComments`
  - `projects.update` (when `reviewComments` is supplied)
- Normalized owned/new review comments to include current actor identity in author fields.

### `convex/lib/validators.ts`
- Extended `reviewCommentValidator.author` with optional `userId`.
- Keeps compatibility with legacy rows while enabling ownership checks.

### `convex/lib/rbac.ts`
- Updated `comments.update` and `comments.remove` RBAC entries to reflect member-level access plus handler-level author-only enforcement.

## Frontend Changes

### `src/app/types.ts`
- Added `ReviewComment` type with `author.userId?: string`.
- Updated project/review comment fields to use this shared type.

### `src/app/components/CreateProjectPopup.tsx`
- Added `user.userId` to review-comment author payloads for newly created comments.
- Delete button on review comments is now shown only for comments owned by the current user.
- Added defensive check to block delete attempts on non-owned comments.
- Added optimistic-update rollback when review comment persistence fails.

### `src/app/DashboardApp.tsx`
- Updated review comment update handler typing to use `ReviewComment[]`.
- Passed `viewerIdentity.userId` into `CreateProjectPopup` user prop.

### `src/app/lib/mappers.ts`
- Updated review comment mapper typing to carry optional `author.userId`.

## Tests

### `convex/__tests__/rbac.test.ts`
- Added/updated coverage for:
  - Review comment ownership enforcement (no cross-user edit/delete).
  - Blocking cross-user edits through both `projects.updateReviewComments` and `projects.update`.
  - Collaboration comments now author-only for edit/remove (admin override denied).

## Validation Run

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:backend -- rbac.test.ts` ✅
- `npm run test:frontend` ✅
