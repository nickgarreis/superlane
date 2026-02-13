# Project detail inline editing live persistence

## Date
- 13-02-2026 12:15

## Goal
- Remove blur-time text snapback for project name/description inline edits.
- Persist edits as characters are added/removed instead of waiting for blur.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/ProjectOverview.tsx`:
  - Inline editor now calls `onCommit` on every input change (typing, deleting, and paste updates).
  - Added optimistic pending value tracking so text remains stable after blur while Convex state catches up.
  - Kept existing hard limits (36 name, 400 description) and no-edit-affordance visual behavior.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Adjusted inline-edit test to assert mutation calls happen directly on `input` events.
  - Added a regression test that verifies no snapback occurs on blur before backend sync.

## Validation
- `npm run test:frontend -- src/app/components/MainContent.test.tsx` ✅
- `npx eslint src/app/components/main-content/ProjectOverview.tsx src/app/components/MainContent.test.tsx` ✅
- `npm run typecheck:frontend` ⚠️ fails due pre-existing syntax errors unrelated to this change:
  - `/Users/nick/Designagency/src/app/components/settings-popup/account-tab/AuthMethodRows.tsx:102`
