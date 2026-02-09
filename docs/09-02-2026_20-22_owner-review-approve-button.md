# Owner-Only Approve Button in Review Page

**Date:** 2026-02-09 20:22
**Type:** UI Feature / Workflow Improvement

## Summary

Added an **Approve** button to the review page (step 4 of `CreateProjectPopup`) so projects in `Review` status can be approved directly from that screen.

The button is visible **only** to users with the `owner` role and only when viewing an existing review project.

## Changes

### `src/app/DashboardApp.tsx`

1. Added `handleApproveReviewProject` callback:
   - Calls `api.projects.setStatus` with `status: "Active"`.
   - Shows success toast (`"Project approved"`).
   - Navigates to the approved project detail view.

2. Passed viewer role into popup `user` prop:
   - Added `role: viewerIdentity.role ?? undefined`.

3. Passed new popup handler prop:
   - `onApproveReviewProject={handleApproveReviewProject}`.

### `src/app/components/CreateProjectPopup.tsx`

1. Extended popup props:
   - `user.role?: WorkspaceRole`
   - `onApproveReviewProject?: (projectId: string) => Promise<unknown>`

2. Added review-approval UI state and handler:
   - `isApprovingReview` loading state
   - `canApproveReviewProject` guard requiring:
     - existing `reviewProject.id`
     - `reviewProject.status.label === "Review"`
     - `user.role === "owner"`
     - callback present
   - `handleApproveReview` executes callback, handles error toast, and closes popup on success.

3. Updated step-4 fixed footer layout:
   - Left side keeps `Delete project`.
   - Right side now conditionally shows `Approve` (owner-only) and `Close`.
   - If approve is visible, `Close` becomes secondary style; otherwise it remains primary as before.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:frontend -- --run` ✅
