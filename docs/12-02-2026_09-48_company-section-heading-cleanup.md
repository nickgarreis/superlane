# Company section heading cleanup

**Date:** 12-02-2026 09:48

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Removed the `General` headline from the company section.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyMembersSection.tsx`:
  - Removed the top `Members` heading.
  - Removed the `Manage workspace access and invitations.` description text.

## Why
- Match requested minimal content in the Company section.
- Keep member management functionality unchanged while reducing visual noise.

## Validation
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx src/app/components/settings-popup/CompanyMembersSection.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
