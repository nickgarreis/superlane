# Archive shortcut added (Command+A)

## Date
- 12-02-2026 20:22

## Goal
Add `⌘A` as a shortcut for opening the Archive page and show that shortcut in the sidebar hover hint.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`:
  - added `a` key handling under Cmd/Ctrl shortcuts to navigate to `archive`.
  - routes to archive using `navigateToPath(viewToPath("archive"))`.
  - added an input/contenteditable guard so `⌘A` keeps normal Select All behavior inside text fields.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.tsx`:
  - added `shortcut="⌘A"` to the Archive sidebar action.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx`:
  - expanded shortcut test to assert `Ctrl+A` navigates to `/archive`.
  - added test ensuring `Ctrl+A` on an `<input>` does not trigger archive navigation.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx`:
  - verifies Archive shortcut label `⌘A` is rendered.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDashboardLifecycleEffects.ts src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/components/sidebar/SidebarPrimaryActions.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx` ✅
