# Inbox activity type icon badges

## Date
- 12-02-2026 15:44

## Goal
Display activity type as an icon-style badge (similar to search popup icon language) instead of text type tags.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - added activity-kind icon mapping (`ACTIVITY_KIND_ICONS`) using existing Lucide icon set:
    - `project` → `Palette`
    - `task` → `ListChecks`
    - `collaboration` → `Bell`
    - `file` → `HardDrive`
    - `membership` → `User`
    - `workspace` → `Building2`
    - `organization` → `Settings`
  - changed `ACTIVITY_KIND_BADGE_BASE_CLASS` to icon-badge sizing/layout (`h-8 w-8`, centered)

- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - replaced text-based type badge content with icon-only rendering
  - kept existing tone colors per activity kind via `activityKindToneClass`
  - added accessibility metadata on icon badge (`aria-label`, `title`, `sr-only` label)

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
