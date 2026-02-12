# Mark read checkmark hover toned down from white

## Date
- 12-02-2026 17:09

## Goal
Keep the `Mark read` checkmark from becoming fully white on hover.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - changed mark-read hover text token from `hover:txt-tone-primary` to `hover:txt-tone-subtle`
  - kept hover background token as `hover:bg-surface-hover-soft`

## Behavior change
- On hover, the mark-read check icon stays in softer gray tones rather than turning bright white.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npm run build --silent` ✅
