# Completed comments empty-state chrome removal

## Date
- 13-02-2026 13:11

## Goal
- Remove the background and border (stroke) styling from the completed project comments history empty-state notification.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.tsx`:
  - Empty-state wrapper class changed from `rounded-xl border border-border-subtle-soft bg-surface-muted-soft/60 px-4 py-6 text-center` to `rounded-xl px-4 py-6 text-center`.
  - This removes both background fill and border/stroke while keeping layout spacing and message text.

## Validation
- `npm run test:frontend -- src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx` ✅
