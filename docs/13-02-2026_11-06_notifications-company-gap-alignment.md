# Notifications to company gap alignment

## Date
- 13-02-2026 11:06

## Goal
- Investigate why the vertical gap below `Notifications` looked smaller than the gap below `Account` in the settings panel.
- Match the `Notifications` -> `Company` gap to the `Account` -> `Notifications` gap.

## Root cause
- `AccountTab` always renders a trailing autosave status row with `pt-2` and `min-h-6`, which adds persistent bottom space to the Account section.
- `NotificationsTab` did not have an equivalent trailing spacer, so the next section appeared closer.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - added `pb-8` specifically to the `Notifications` section container.
  - this increases the space before the `Company` section to visually match the Account-to-Notifications spacing.

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`:
  - added an assertion that the `Notifications` section includes `pb-8` to prevent regressions.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
