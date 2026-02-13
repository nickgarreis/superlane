# Settings pending tag border token separated from text token

## Date
- 13-02-2026 11:34

## Goal
- Update the pending invitation tag so its border color is not the same as its text color, following the established tag pattern (text + softer border/background tokens).

## What changed
- Updated `/Users/nick/Designagency/src/styles/theme.css`:
  - added a dedicated orange review border token:
    - `--status-review-border: rgba(255, 95, 31, 0.35)`
  - exposed it in theme color aliases:
    - `--color-status-review-border: var(--status-review-border)`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`:
  - changed `pending` tone border from `--status-review` to new `--status-review-border`.
  - resulting token mapping:
    - text: `--status-review`
    - background: `--status-review-soft`
    - border: `--status-review-border`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`:
  - updated pending-tone border assertion to validate `--status-review-border`.

## Validation
- `npx vitest run src/app/components/sidebar/SidebarTag.test.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarTag.tsx src/app/components/sidebar/SidebarTag.test.tsx src/app/components/settings-popup/PendingInvitationRow.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
