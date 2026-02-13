# Settings pending invitation tag switched to orange review tokens

## Date
- 13-02-2026 11:31

## Goal
- Make the Settings pending invitation tag more orange (less yellow) while keeping styling fully token-driven.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`:
  - kept shared tag component usage.
  - remapped `pending` tone away from warning/collaboration yellow tokens.
  - reused existing orange review tokens:
    - `[color:var(--status-review)]`
    - `[background-color:var(--status-review-soft)]`
    - `[border-color:var(--status-review)]`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`:
  - renamed pending-tone test to indicate orange review tokens.
  - updated assertions to verify `status-review` token usage.
  - added assertion that `txt-tone-warning` is not applied for pending tone.

## Validation
- `npx vitest run src/app/components/sidebar/SidebarTag.test.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarTag.tsx src/app/components/sidebar/SidebarTag.test.tsx src/app/components/settings-popup/PendingInvitationRow.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
