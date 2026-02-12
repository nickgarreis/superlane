# Settings popup single-page redesign

**Date:** 12-02-2026 09:38

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Removed the left sidebar/tab layout.
  - Replaced it with a compact top header and horizontal section chips (`My Account`, `Notifications`, `Company`, `Billing & Plans`).
  - Rendered all settings content in one vertical, scrollable page inside the popup.
  - Kept existing settings section components and handlers intact:
    - `AccountTab`
    - `NotificationsTab`
    - `CompanyTab`
    - `BillingTab`
  - Preserved `initialTab` behavior by auto-scrolling to the requested section when opened.
  - Added active section tracking so chip state reflects current section while scrolling.
  - Kept popup close behavior (overlay click + close button).

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`:
  - Replaced tab-switching assertions with single-page section-navigation assertions.
  - Added coverage for compact section chip state (`aria-current`).
  - Kept backdrop close assertion.

## Why
- Align the Settings popup with the project’s popup design language while removing the visual weight of a split sidebar layout.
- Support a cleaner, minimalist single-page structure without removing any existing settings functionality.
- Preserve route-driven/open-state behavior that depends on `initialTab`.

## Validation
- `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx` ✅
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npm run typecheck` ✅
