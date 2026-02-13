# Project detail inline text editing (active + archived)

## Date
- 13-02-2026 12:10

## Goal
- Allow users to click directly into project name and description in project detail and edit inline.
- Keep zero edit affordance UI (no icons, no counters, no edit mode styling).
- Enforce hard typing limits with silent cutoff:
  - Name: 36 characters
  - Description: 400 characters
- Scope editability to active and archived detail pages only.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/ProjectOverview.tsx`:
  - Added an internal `InlineEditableText` renderer based on `contentEditable` so display and edit states remain visually identical.
  - Added hard cap logic for both typing and paste flows.
  - Prevented line breaks (`Enter`) to preserve the existing one-block text presentation.
  - Commit-on-blur behavior now calls `projectActions.updateProject` with changed values only.
  - Gated editability to `project.status.label === "Active"` or `project.archived === true`.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Added tests for inline edits with truncation to 36/400 char limits.
  - Added coverage confirming archive detail remains editable.
  - Added coverage confirming completed detail text remains non-editable.
  - Refactored test helper to allow per-test `projectActions` mocks.

## Validation
- `npm run test:frontend -- src/app/components/MainContent.test.tsx` ✅
- `npm run typecheck` ✅
- `npx eslint src/app/components/main-content/ProjectOverview.tsx src/app/components/MainContent.test.tsx` ✅
