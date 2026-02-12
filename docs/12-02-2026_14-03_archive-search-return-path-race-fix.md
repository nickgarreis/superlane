# Fix archive-origin redirect race for Draft/Review popup routing

## Date
- 12-02-2026 14:03

## Problem
- In some archive -> search -> draft/review navigation flows, users could still land on `/tasks`.
- Root cause: origin-path tracking in the Draft/Review route guard used `useEffect` (post-render), so redirect logic could execute before the non-project origin path was persisted.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - Replaced effect-based origin-path tracking with synchronous `useRef` updates during render.
  - Non-project paths (like `/archive`) are now captured immediately before redirect logic runs.
  - Draft/Review redirect therefore consistently returns to the originating page instead of falling back to `/tasks`.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
