# Completed project detail popup width reduced

## Date
- 12-02-2026 15:13

## Goal
- Reduce the width of the completed project detail popup.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/CompletedProjectDetailPopup.tsx`:
  - Reduced popup container max width from `max-w-[1120px]` to `max-w-[980px]`.
  - Kept existing responsive behavior (`w-full`) and height constraints unchanged.

## Validation
- `npx eslint src/app/components/CompletedProjectDetailPopup.tsx` ✅
