# Token Color Update

**Date:** 11-02-2026 09:44

## Summary
Updated the dark surface token and aligned related hardcoded surface backgrounds from `#191A1A`/equivalent dark surface values to `#171818`.

## Changes
- Updated `--color-bg-surface` in `src/styles/theme.css` to `#171818`.
- Updated `--normal-bg` in `src/styles/theme.css` to `#171818`.
- Updated hardcoded dropdown/modal/panel background values from `#1A1A1C` to `#171818` in:
  - `src/app/components/Tasks.tsx`
  - `src/app/dashboard/components/DashboardChrome.tsx`
  - `src/app/components/BrandAssets.tsx`
  - `src/app/components/settings-popup/InviteMemberForm.tsx`
  - `src/app/components/FeedbackPopup.tsx`
  - `src/app/components/settings-popup/MemberRow.tsx`
  - `src/app/components/SidebarHelpActions.tsx`
  - `src/app/components/project-tasks/TasksToolbar.tsx`
  - `src/app/components/main-content/MenuIcon.tsx`
  - `src/app/components/main-content/FileSection.tsx`
  - `src/app/components/sidebar/SidebarWorkspaceSwitcher.tsx`
  - `src/app/components/sidebar/SidebarProfileMenu.tsx`

## Validation
- Verified with search that no `#1A1A1C` or `#181819` values remain in targeted files.
- Confirmed updated references now point to `#171818`.
