# Sidebar keyboard shortcuts and hover hints

## Date
- 12-02-2026 20:12

## Goal
Add new global keyboard shortcuts for inbox, create project, and settings, and show matching shortcut hints on sidebar hover states.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`:
  - expanded the global keydown handler from search-only to shared shortcuts.
  - added support for:
    - `⌘K` / `Ctrl+K` → open search
    - `⌘I` / `Ctrl+I` → open inbox
    - `⌘N` / `Ctrl+N` → open create project popup
    - `⌘,` / `Ctrl+,` → open settings
  - added modifier guards so shortcuts only trigger with primary modifier and without `Shift`/`Alt`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`:
  - passed `openInbox`, `openCreateProject`, and `handleOpenSettings` into lifecycle shortcut wiring.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.tsx`:
  - added hover shortcut pills:
    - `Inbox` → `⌘I`
    - `Create Project` → `⌘N`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.tsx`:
  - added hover shortcut pill:
    - `Settings` → `⌘,`

## Tests and validation
- Added `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx`:
  - verifies shortcut labels render (`⌘K`, `⌘I`, `⌘N`) and actions fire.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx`:
  - verifies the new key combos trigger the expected callbacks.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.test.tsx`:
  - verifies settings shortcut label `⌘,` renders.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.test.tsx`:
  - aligned navigation mock shape with new lifecycle wiring inputs.

- Validation commands:
  - `npx vitest run src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.test.tsx` ✅
  - `npx eslint src/app/dashboard/hooks/useDashboardLifecycleEffects.ts src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.ts src/app/dashboard/hooks/useDashboardDataLayer.test.tsx src/app/components/sidebar/SidebarPrimaryActions.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/sidebar/SidebarProfileMenu.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx` ✅

## Notes
- Running `npm run test:frontend -- ...` executes the full `src/app` suite by script design; one unrelated pre-existing failure remains in `src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx` (object key count assertion). Targeted tests for this change are passing.
