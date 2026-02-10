# Remove Camera Button From Workspace Creation Popup

**Date:** 2026-02-10 11:56

## Summary

Removed the non-functional camera button/icon from the workspace creation popup UI.

## Changes

- **`src/app/components/create-workspace-popup/CreateWorkspacePopup.tsx`**
  - Removed the trailing camera icon element shown in the company profile image section.
  - Removed unused `Camera` import from `lucide-react`.

## Validation

- `npx eslint src/app/components/create-workspace-popup/CreateWorkspacePopup.tsx` ✅
