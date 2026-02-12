# Unread activity indicator changed to blue icon dot

## Date
- 12-02-2026 16:31

## Goal
Replace the unread left stroke indicator with a blue dot positioned at the top-right of the activity type icon.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed unread left-stroke styling from the row container (`border-l-2 border-l-accent-soft-border-strong pl-[14px]`)
  - made the activity type icon badge container `relative`
  - added unread indicator dot as an absolutely positioned element on the icon (`absolute -right-1 -top-1 size-2 rounded-full bg-text-tone-accent ring-2 ring-bg-surface`)

## Behavior change
- Unread state is now shown as a blue dot on the activity type icon instead of a left-side row stroke.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
