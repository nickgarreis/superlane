# Core Dashboard UI Consistency Cleanup

**Date:** 11-02-2026 12:17

## Summary
Implemented a minimal, targeted frontend consistency pass across authenticated dashboard surfaces using shared menu chrome primitives, status color fixes, z-layer normalization, avatar fallback token unification, and toast style source cleanup.

## What Changed

### 1) Shared menu chrome primitives
- Added `/Users/nick/Designagency/src/app/components/ui/menuChrome.ts` with:
  - `MENU_SURFACE_CLASS`
  - `MENU_HEADER_CLASS`
  - `MENU_ITEM_CLASS`
  - `MENU_ITEM_ACTIVE_CLASS`
  - `MENU_CHECK_ICON_CLASS`
- Added menu shadow token + utility in `/Users/nick/Designagency/src/styles/theme.css`:
  - `--shadow-menu-surface`
  - `@utility shadow-menu-surface`
- Applied shared menu primitives to these components:
  - `/Users/nick/Designagency/src/app/components/Tasks.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/TasksToolbar.tsx`
  - `/Users/nick/Designagency/src/app/components/main-content/FileSection.tsx`
  - `/Users/nick/Designagency/src/app/components/main-content/MenuIcon.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRow.tsx`
  - `/Users/nick/Designagency/src/app/components/mentions/MentionDropdown.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ProjectDropdown.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentActions.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ReactionPicker.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/InviteMemberForm.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/MemberRow.tsx`
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.tsx`
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarWorkspaceSwitcher.tsx`

### 2) Status semantics and shape artifact cleanup
- Updated `/Users/nick/Designagency/src/app/components/search-popup/SearchPopupListItems.tsx`:
  - Replaced forced `var(--status-review)` with dynamic `item.status.color` fallback.
  - Replaced `rounded-[16777200px]` with `rounded-full`.
- Updated `/Users/nick/Designagency/src/app/components/main-content/ProjectOverview.tsx`:
  - Replaced hardcoded status colors with shared project status color + archived fallback token.
  - Replaced `rounded-[16777200px]` with `rounded-full`.

### 3) z-layer normalization
- Added `/Users/nick/Designagency/src/app/lib/zLayers.ts` with shared layer constants.
- Replaced outlier z-index values with shared constants in:
  - `/Users/nick/Designagency/src/app/components/mentions/MentionDropdown.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentActions.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRows.tsx`

### 4) Avatar fallback unification
- Replaced raw fallback avatar backgrounds with `bg-bg-avatar-fallback` in:
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarView.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentComposerInline.tsx`
  - `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentItem.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRow.tsx`

### 5) Toast style source cleanup
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.tsx`:
  - Removed hardcoded `toastOptions.style` inline object.
  - Kept className/type styling so `/Users/nick/Designagency/src/styles/theme.css` remains the styling source.

## Validation
- Ran frontend tests (targeted suite):
  - `npm run test:frontend -- src/app/components/Tasks.test.tsx src/app/components/ProjectTasks.test.tsx src/app/components/SearchPopup.test.tsx src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx`
  - Result: pass.
- Ran lint:
  - `npm run lint`
  - Result: pass.

## Notes
- Requested file `src/app/components/project-tasks/TasksToolbar.test.tsx` is not present in the repository; validation covered nearby task toolbar behavior through existing task component tests.
