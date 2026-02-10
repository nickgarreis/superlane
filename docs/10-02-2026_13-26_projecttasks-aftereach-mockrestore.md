# ProjectTasks Test Cleanup Hardening

**Date:** 10-02-2026 13:26

## Summary
Updated the `afterEach` cleanup in `ProjectTasks.test.tsx` to guarantee `consoleErrorSpy.mockRestore()` always runs, even when assertions fail.

## Changes
- `src/app/components/ProjectTasks.test.tsx`
  - Wrapped the `expect(refWarnings).toHaveLength(0)` assertion in a `try` block.
  - Moved `consoleErrorSpy.mockRestore()` into a `finally` block so mock cleanup is guaranteed on failure.

## Validation
- Ran: `npx vitest run src/app/components/ProjectTasks.test.tsx`
- Result: 1 test file passed, 6 tests passed.
