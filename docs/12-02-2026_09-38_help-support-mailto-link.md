# Help & Support mailto redirect

**Date:** 12-02-2026 09:38

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.tsx`:
  - Changed the Help & Support action to open `mailto:NOTIFICATIONS_FROM_EMAIL`.
  - Updated target to `_self` so the action redirects the current page context to the mailto handler.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.test.tsx`:
  - Adjusted the expected `window.open` call to `mailto:NOTIFICATIONS_FROM_EMAIL` with `_self`.

## Why
- Aligns the Help & Support button behavior with the requirement to route users to the notifications email mailto target.

## Validation
- `npm run test:frontend -- src/app/components/sidebar/SidebarProfileMenu.test.tsx` ✅
