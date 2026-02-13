# Completed comments remove header icon

## Date
- 13-02-2026 13:18

## Goal
- Remove the left icon from the completed-project comments history header.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.tsx`:
  - Removed `MessageSquare` icon from the header row.
  - Removed the now-unused `MessageSquare` import from `lucide-react`.

## Validation
- `npm run test:frontend -- src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx` ✅
