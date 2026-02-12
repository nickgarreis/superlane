# Mark read hover toned further down

## Date
- 12-02-2026 17:10

## Goal
Tone down the `Mark read` hover effect even more so the checkmark appears less bright.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - changed mark-read hover classes from:
    - `hover:bg-surface-hover-soft`
    - `hover:txt-tone-subtle`
  - to:
    - `hover:bg-surface-hover-subtle`
    - `hover:txt-tone-faint`

## Behavior change
- `Mark read` hover is now more restrained:
  - lighter, subtler grey background
  - dimmer grey checkmark tone

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
