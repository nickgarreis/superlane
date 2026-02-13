# Settings pending invitation badge migrated to reusable tag component

## Date
- 13-02-2026 11:28

## Goal
- Replace the hardcoded `Pending` invitation badge styling in Settings > Company > Members with the shared tag component introduced today, using design-token classes instead of hardcoded amber values.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`:
  - extended `SidebarTagTone` with `"pending"`.
  - added `pending` tone mapping using existing warning token classes:
    - `txt-tone-warning`
    - `[background-color:var(--activity-collaboration-bg)]`
    - `[border-color:var(--activity-collaboration-border)]`

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/PendingInvitationRow.tsx`:
  - removed hardcoded badge classes:
    - `bg-amber-500/15`
    - `text-amber-300/80`
  - replaced inline `Pending` badge span with:
    - `<SidebarTag tone="pending">Pending</SidebarTag>`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`:
  - added `pending` tone test asserting tokenized warning classes and `data-sidebar-tag-tone="pending"`.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyMembersSection.test.tsx`:
  - added regression assertion that the invitation badge renders via shared tag component (`data-sidebar-tag-tone="pending"`).

## Validation
- `npx vitest run src/app/components/sidebar/SidebarTag.test.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarTag.tsx src/app/components/sidebar/SidebarTag.test.tsx src/app/components/settings-popup/PendingInvitationRow.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
