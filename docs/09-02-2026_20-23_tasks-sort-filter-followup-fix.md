# Tasks Page: Sort/Filter Follow-up Fix

**Date:** 2026-02-09 20:23
**Type:** Bug Fix / Tasks UX

## Summary

Fixed an ordering conflict that made Tasks-page sorting appear broken and verified filter behavior in the same flow.

## Root Cause

`src/app/components/Tasks.tsx` already sorted and filtered the list before passing it to `ProjectTasks`, but `src/app/components/ProjectTasks.tsx` re-sorted the incoming list internally (defaulting to due date). This overrode the Tasks-page sort selection.

## Changes

### `src/app/components/ProjectTasks.tsx`
- Added optional prop `disableInternalSort?: boolean`.
- Updated sorting logic to preserve incoming task order when `disableInternalSort` is enabled.

### `src/app/components/Tasks.tsx`
- Passed `disableInternalSort={true}` to `ProjectTasks` for the Tasks page so top-level sort/filter controls are authoritative.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:frontend` ✅
