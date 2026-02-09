# Comment Resolution Ownership Enforcement

**Date:** 2026-02-09 20:35
**Type:** Authorization / RBAC

## Summary

Restricted comment resolution so users can only resolve/unresolve comments they authored.

## Changes

### `convex/comments.ts`

1. Added an author-ownership guard in `toggleResolved`:
   - If `comment.authorUserId !== appUser._id`, the mutation now throws `ConvexError("Forbidden")`.
2. Kept project membership validation via `requireProjectRoleById(..., "member")` unchanged.

### `src/app/components/ChatSidebar.tsx`

1. Updated resolve action visibility to match backend permissions:
   - Resolve/Resolved button now renders only when the comment is both top-level and owned by the current user (`isTopLevel && isOwn`).

### `convex/__tests__/rbac.test.ts`

1. Updated comment RBAC test expectations:
   - Non-author member cannot toggle resolution (`Forbidden`).
   - Admin cannot toggle resolution of another user’s comment (`Forbidden`).
   - Author can toggle their own comment resolution.
2. Renamed test to reflect new policy: author-only resolution.

## Validation

- `npm run test:backend -- convex/__tests__/rbac.test.ts` ✅
- `npm run lint` ✅
