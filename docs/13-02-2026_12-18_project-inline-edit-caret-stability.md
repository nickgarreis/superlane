# Project inline editing caret stability

## Date
- 13-02-2026 12:18

## Goal
- Prevent caret reset to the beginning while inline auto-save runs for project name and description.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/ProjectOverview.tsx`:
  - Converted the inline editable text node to an uncontrolled `contentEditable` rendering strategy (no React-managed text children while editing).
  - Added layout-effect based text sync via direct DOM updates only when safe.
  - Kept optimistic pending-value behavior so backend lag does not force stale text into the field.
  - Preserved per-character auto-save and existing hard limits.

## Validation
- `npm run test:frontend -- src/app/components/MainContent.test.tsx` ✅
- `npx eslint src/app/components/main-content/ProjectOverview.tsx src/app/components/MainContent.test.tsx` ✅
