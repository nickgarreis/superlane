# Activity description-to-meta gap increased

## Date
- 12-02-2026 16:40

## Goal
Increase the vertical gap between activity description/message and the createdAt/tag section.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - changed meta row top margin from `mt-0.5` to `mt-1`
  - this increases spacing between the title/description line and the createdAt + Important row

## Behavior change
- The createdAt/tag section sits slightly lower with more breathing room under the description/message.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
