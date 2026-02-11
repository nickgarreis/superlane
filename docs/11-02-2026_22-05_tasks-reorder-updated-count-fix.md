# Tasks Reorder Updated Count Fix

**Date:** 11-02-2026 22:05

## What changed
- Updated `convex/tasks.ts` in `tasks.reorder` to return the true number of patched tasks:
  - The `tasksToReorder` `Promise.all` mapping now returns `0` when a task is already at the target position.
  - The mapping returns `1` only when `ctx.db.patch(...)` is executed.
  - The mutation now sums these values and returns that total as `updated`.
- Updated `convex/__tests__/tasks_reorder.test.ts`:
  - In `does not patch tasks whose position already matches requested order`, changed `expect(reordered.updated).toBe(2)` to `expect(reordered.updated).toBe(0)`.

## Why
- `orderedTaskIds.length` could over-report updates when some tasks were already in the requested positions.
- The no-op reorder test should validate that no unnecessary patches are counted.

## Validation
- Ran `npm run test:backend -- convex/__tests__/tasks_reorder.test.ts`.
- Result: pass (`11` test files, `60` tests).
