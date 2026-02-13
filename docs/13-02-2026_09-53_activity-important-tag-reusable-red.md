# Activity Important badge migrated to reusable SidebarTag with red tokens

## Date
- 13-02-2026 09:53

## Goal
Convert the activity-row "Important" badge to the reusable tag component and keep red tokenized styling.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`:
  - expanded `SidebarTagTone` to include `"important"`.
  - added `important` tone token classes:
    - `txt-tone-danger`
    - `bg-popup-danger-soft`
    - `border-popup-danger-soft-strong`

- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed `IMPORTANT_STATUS_PILL_CLASS` usage.
  - imported `SidebarTag`.
  - replaced Important span with:
    - `<SidebarTag tone="important">Important</SidebarTag>`

- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - removed now-unused `IMPORTANT_STATUS_PILL_CLASS` export.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - collaboration important-badge regression now also asserts:
    - `data-sidebar-tag-tone="important"`
  - retained existing red token class assertions.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`:
  - added dedicated `important` tone test verifying red token classes.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx` ✅
- `npx eslint /Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx /Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx /Users/nick/Designagency/src/app/components/ui/controlChrome.ts` ✅
- `npm run build` ✅
