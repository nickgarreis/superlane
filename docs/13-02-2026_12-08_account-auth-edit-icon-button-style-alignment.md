# Account auth edit action switched to inbox-style icon button

## Date
- 13-02-2026 12:08

## Goal
- Replace the `Edit email & password` text button with an icon-only control.
- Match the same visual style and hover behavior used by the Inbox activity record "mark read/ready" action.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/account-tab/AuthMethodRows.tsx`:
  - replaced text action button with icon-only `Pencil` button for the email row.
  - switched button chrome to `TABLE_ACTION_ICON_BUTTON_CLASS`.
  - applied the same hover effect used by Inbox mark-read action:
    - `hover:bg-surface-hover-subtle`
    - `hover:txt-tone-faint`
  - preserved accessibility via:
    - `aria-label="Edit email & password"`
    - `title="Edit email & password"`

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅

## Notes
- Behavior is unchanged: click still opens the credentials modal.
- This update is presentation-only (button chrome + icon-only affordance).
