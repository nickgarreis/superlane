# Account section minimal layout

**Date:** 12-02-2026 09:45

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Simplified layout to a single minimal row: profile picture on the left, name/email fields on the right.
  - Removed the `Profile Picture` heading.
  - Removed manual avatar action buttons: `Upload new` and `Remove`.
  - Kept avatar update via click/keyboard on the avatar itself (opens file picker, uploads immediately).
  - Kept existing debounced auto-save for first name, last name, and email.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`:
  - Updated avatar test to assert manual avatar action buttons/heading are not present.
  - Kept avatar upload verification via file input.
  - Kept auto-save test intact.

## Why
- Match requested minimalist account section structure and remove extra controls.
- Preserve existing auto-save flow and fast avatar update interaction.

## Validation
- `npx eslint src/app/components/settings-popup/AccountTab.tsx src/app/components/settings-popup/AccountTab.test.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/AccountTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npm run typecheck:frontend` ✅
