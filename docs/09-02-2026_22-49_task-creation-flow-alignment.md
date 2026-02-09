# Task Creation Flow Alignment (Tasks vs Project Detail)

**Date:** 09-02-2026 22:49

## Summary

Aligned the task creation row behavior so both task tables follow the same two-step flow:
- Step 1: user enters only task name.
- Step 2: user creates task via Enter or the new right-aligned `Create` button.
- After creation: row-level controls appear on the created task (project/due date/assignee/delete on Tasks page, due date/assignee/delete on Project Detail page).

## Changes

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Removed pre-create project dropdown state and UI from the add-task row.
- Removed pre-create placeholder columns (`Project`, `Due Date`, etc.) from the add-task row.
- Added right-aligned create action button to the add-task row with shortcut label (`Enter`) and disabled state when title is empty.
- Kept Enter-to-create keyboard flow and added `preventDefault()` for consistent behavior.
- Preserved post-creation row controls unchanged.

## Validation

- `npm run lint` ✅
- `npm run test:frontend` ✅
- `npm run typecheck` ❌ (pre-existing unrelated errors in `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`)
  - `TS2440`: Import declaration conflicts with local declaration of `CreateProjectPayload`
  - `TS2304`: Cannot find name `imgGroup`
  - `TS2304`: Cannot find name `imgGroupOutlook`
