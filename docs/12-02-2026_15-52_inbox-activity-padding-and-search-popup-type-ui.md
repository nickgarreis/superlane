# Inbox activity padding and search-popup type UI

## Date
- 12-02-2026 15:52

## Goal
- Increase top and bottom inner padding for inbox activity records.
- Make activity type icon UI match the search popup icon treatment.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - increased activity row vertical padding from `py-3` to `py-4`
  - updated activity type icon badge base class to match search popup icon containers (`size-8 rounded-lg flex items-center justify-center shrink-0`)
  - replaced tone-class resolver with `activityKindIconChrome()` that maps activity kinds to search-popup-style icon chrome:
    - project: `bg-surface-hover-soft` + muted icon
    - task/file: `bg-surface-muted-soft` + muted icon
    - collaboration/membership/workspace/organization: `bg-text-tone-accent-soft` + accent icon

- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - switched activity type styling from tone utility classes to `activityKindIconChrome()`
  - type icon now uses search-popup-equivalent sizing (`size={15}`)
  - adjusted unread action icon top offset to align with increased row padding (`top-4`)

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - replaced old tone-class assertions with icon chrome assertions matching new search-popup-style classes

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
