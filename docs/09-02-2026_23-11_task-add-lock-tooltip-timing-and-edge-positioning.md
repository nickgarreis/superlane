# Task Add Lock Tooltip: Slower Reveal + Edge-Safe Positioning

**Date:** 09-02-2026 23:11

## Summary

Adjusted the locked `+ Add Task` hover message to:
- appear with a slower transition, and
- avoid right-edge clipping by using edge-safe positioning and responsive width.

## Changes

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Increased tooltip reveal transition from `duration-75` to `duration-200` with `ease-out`.
- Changed horizontal positioning from `left-0` to `right-0` to anchor inside the viewport edge.
- Added responsive width constraint:
  - `w-[min(280px,calc(100vw-24px))]`
- Switched from single-line nowrap to wrapped text for small screens.
- Kept the same visual style and message text.

## Validation

- `npx eslint src/app/components/ProjectTasks.tsx` ✅
