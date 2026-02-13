# Create project shortcut changed to Command+P

## Date
- 12-02-2026 20:16

## Goal
Change the create-project keyboard shortcut from `⌘N` to `⌘P`, including sidebar hover hint text.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`:
  - changed global create-project shortcut key handling from `n` to `p` while keeping `Cmd/Ctrl` modifier behavior.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.tsx`:
  - changed Create Project hover shortcut pill from `⌘N` to `⌘P`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx`:
  - updated keyboard-event test to dispatch `Ctrl+P` instead of `Ctrl+N` for create project.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx`:
  - updated shortcut label assertion from `⌘N` to `⌘P`.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDashboardLifecycleEffects.ts src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx src/app/components/sidebar/SidebarPrimaryActions.tsx src/app/components/sidebar/SidebarPrimaryActions.test.tsx` ✅
