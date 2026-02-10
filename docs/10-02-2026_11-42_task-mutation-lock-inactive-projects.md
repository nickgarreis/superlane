# Lock Task Editing/Removal For Inactive Projects

**Date:** 2026-02-10 11:42

## Summary

Enforced that tasks can only be mutated for active projects, not just created for active projects.

This closes the gap where archived/completed project tasks could still be edited or removed.

## Changes

- **`convex/tasks.ts`**
  - Added lifecycle guard helpers for task mutation eligibility:
    - project must be non-deleted
    - `archived !== true`
    - `status === "Active"`
    - `completedAt == null`
  - Applied guard to project-scoped replacement via `replaceProjectTasks` (used by `replaceForProject` and `bulkReplaceForWorkspace`).
  - Tightened `replaceForWorkspace` active project resolution to the same lifecycle criteria.

- **`src/app/components/ProjectTasks.tsx`**
  - Added new optional props to control task row mutability:
    - `canEditTasks?: boolean`
    - `canEditTask?: (task: Task) => boolean`
    - `editTaskDisabledMessage?: string`
  - Guarded all edit/remove pathways:
    - complete toggle
    - due date change
    - assignee change
    - project move
    - delete action
  - Added locked-state affordances (`cursor-not-allowed`, reduced interactive styling, disabled delete button, disabled tooltips).
  - Closes open task dropdowns when edit mode is disabled.

- **`src/app/components/MainContent.tsx`**
  - Reused existing active-project predicate (`canCreateProjectTasks`) to also lock task editing/removal in project detail:
    - `canEditTasks={canCreateProjectTasks}`
    - `editTaskDisabledMessage="Tasks can only be edited for active projects"`

- **`convex/__tests__/rbac.test.ts`**
  - Added assertion that `tasks.replaceForProject` is rejected once a project is completed, with expected error:
    - `Tasks can only be modified for active projects`

## Validation

- `npx eslint convex/tasks.ts convex/__tests__/rbac.test.ts src/app/components/ProjectTasks.tsx src/app/components/MainContent.tsx` ✅
- `npm run typecheck:frontend` ✅
- `npm run test:backend -- convex/__tests__/rbac.test.ts` ✅
