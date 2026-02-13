# AccountTab component split for size gate

## Date
- 13-02-2026 11:33

## Goal
- Split `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx` into smaller subcomponents so it satisfies the component-size quality gate.

## What changed
- Refactored `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx` into a lean orchestrator component that now focuses on state/effects/handlers.
- Added new subcomponents under `/Users/nick/Designagency/src/app/components/settings-popup/account-tab/`:
  - `authProviders.tsx` (provider metadata and provider-row helper logic)
  - `AuthMethodRows.tsx` (renders linked auth rows)
  - `AccountProfileEditor.tsx` (avatar + first/last name form section)
  - `AccountCredentialsModal.tsx` (email/password edit modal)
  - `DiscardCredentialsChangesDialog.tsx` (discard confirmation modal)
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx` fixture shape to include `linkedIdentityProviders` so `AccountTab` receives complete account data.

## Result
- `AccountTab.tsx` line count reduced from 960 to 396 lines.
- Component-size check now passes for this file.

## Validation
- `node scripts/quality/check-component-size.mjs` ✅
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npm run typecheck` ✅

## Notes
- Full `npm run lint` still reports pre-existing failures in feature-file size checks unrelated to this refactor (`src/app/dashboard/useDashboardNavigation.ts`, `convex/activities.ts`).
