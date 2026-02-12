# Notifications and settings fixes

**Date:** 12-02-2026 10:27

## What changed
- Updated `/Users/nick/Designagency/convex/notificationsEmail.ts`:
  - Switched `logError` to `logInfo` for the expected "Email dispatch disabled" path in `sendForToggle`.
  - Kept context payload unchanged (`toggle`, `workspaceId`, `consideredRecipients`, `eligibleRecipients`).

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Fixed user-facing button copy from `Manage blling` to `Manage billing`.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.test.tsx`:
  - Updated the button label assertion to `Manage billing`.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.tsx`:
  - In autosave error handling, changed `setAutoSaveStatus("idle")` to `setAutoSaveStatus("pending")` so unsaved state remains visible.

- Added `/Users/nick/Designagency/src/app/lib/contact.ts`:
  - Introduced shared `NOTIFICATIONS_FROM_EMAIL` constant (optional `VITE_NOTIFICATIONS_FROM_EMAIL` with fallback).

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.tsx`:
  - Replaced literal mailto string with interpolation using `NOTIFICATIONS_FROM_EMAIL`.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.test.tsx`:
  - Imported `NOTIFICATIONS_FROM_EMAIL` and asserted `window.open` uses ``mailto:${NOTIFICATIONS_FROM_EMAIL}``.

## Validation
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/settings-popup/NotificationsTab.test.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx` ✅
- `npx eslint convex/notificationsEmail.ts src/app/components/settings-popup/CompanyTab.tsx src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/settings-popup/NotificationsTab.tsx src/app/components/sidebar/SidebarProfileMenu.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx src/app/lib/contact.ts` ✅
