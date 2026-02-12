# Important tag switched to red tokenized styling

## Date
- 12-02-2026 16:49

## Goal
Make the inbox activity `Important` tag red (instead of yellow) without hardcoded colors by reusing/creating tokens.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - added `IMPORTANT_STATUS_PILL_CLASS` token:
    - `txt-tone-danger`
    - `bg-popup-danger-soft`
    - `border-popup-danger-soft-strong`
  - this reuses existing semantic color tokens and avoids hardcoded color values.
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - switched `Important` badge from `WARNING_STATUS_PILL_CLASS` to `IMPORTANT_STATUS_PILL_CLASS`.
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - changed badge assertions from warning/yellow class checks to the new danger/red token class checks.

## Behavior change
- `Important` badges in activity rows now render with red semantic styling.
- Other warning badge usages (e.g. sidebar `Approved`) remain unchanged.

## Validation
- `npx eslint src/app/components/ui/controlChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx -t "renders collaboration row with search-style accent icon chrome"` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx` ⚠️ fails on an unrelated existing assertion in mention click mapping (`expected "project", received "file"`).
