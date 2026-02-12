# Mark read button gray hover added

## Date
- 12-02-2026 17:07

## Goal
Add a hover effect to the inbox activity-row `Mark read` button while keeping the styling in gray tones.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - changed `Mark read` button class from `TABLE_ACTION_ICON_BUTTON_SUCCESS_CLASS` to:
    - `TABLE_ACTION_ICON_BUTTON_CLASS`
    - `hover:bg-surface-hover-soft`
    - `hover:txt-tone-primary`

## Behavior change
- `Mark read` now has a gray hover interaction:
  - subtle gray background on hover
  - brighter neutral icon/text tone on hover
- No green success hover styling is used for `Mark read`.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npm run build --silent` ✅
- Verified generated CSS includes:
  - `hover:bg-surface-hover-soft`
  - `hover:txt-tone-primary`
