# Inbox trash hover effect restored

## Date
- 12-02-2026 17:06

## Goal
Fix the inbox activity-row trash button hover effect so the icon turns red and background turns a lighter red (same logic as file table rows), using tokens only.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - trash button now uses:
    - `TABLE_ACTION_ICON_BUTTON_CLASS`
    - `hover:bg-popup-danger-soft-hover`
    - `hover:txt-tone-danger`
- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`:
  - file row remove button (virtualized + non-virtualized) now uses the same hover token classes as inbox activity trash button.
- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - retained shared base button token and hover token definitions; hover logic now explicitly present in component-level class strings where Tailwind source scanning guarantees emission.

## Behavior change
- Inbox activity trash button now clearly shows:
  - red icon on hover
  - lighter red hover background
- File table row trash button remains visually matched.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/main-content/MainContentFileRows.tsx src/app/components/ui/controlChrome.ts` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/components/MainContent.test.tsx` ✅
- `npm run build --silent` ✅
- Verified generated CSS contains:
  - `hover:bg-popup-danger-soft-hover`
  - `hover:txt-tone-danger`
