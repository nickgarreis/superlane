# Completed Sidebar Popup White Screen Fix

**Date:** 09-02-2026 23:00

## Summary

Fixed a React hook-order crash that caused a white screen when opening the `Completed` projects popup from the sidebar.

## Root Cause

`CompletedProjectsPopup` returned early when `isOpen` was `false` before all hooks ran. When the popup was later opened (`isOpen === true`), additional hooks (`useMemo`) executed, violating React's Rules of Hooks and causing a runtime crash.

## Changes

### `/Users/nick/Designagency/src/app/components/CompletedProjectsPopup.tsx`
- Moved `if (!isOpen) return null;` to after all hook calls.
- Ensured hooks are called in a consistent order on every render.

## Validation

- `npx eslint src/app/components/CompletedProjectsPopup.tsx` ✅
- `npx vitest run src/app/components/sidebar/partitionProjects.test.ts` ✅
- `npm run test:frontend -- src/app/components/sidebar/partitionProjects.test.ts` ❌ (existing unrelated `figma:asset/...` resolution issue in `CreateProjectWizardDialog.test.tsx`)
