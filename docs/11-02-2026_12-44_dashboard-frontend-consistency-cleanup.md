# Dashboard Frontend Consistency Cleanup (Minimal + Structural)

**Date:** 11-02-2026 12:44

## Summary
Implemented a targeted dashboard-only frontend consistency pass focused on layering normalization, tokenized surface/color cleanup, reusable UI chrome primitives, sidebar style alignment, and floating surface unification.

## What Changed

### 1) Layering normalization via shared z-layer contract
- Expanded `/Users/nick/Designagency/src/app/lib/zLayers.ts` with:
  - `modalPriority`
  - `dropdown`
  - retained `popover` for compatibility
- Replaced hardcoded overlay z-indexes with `style={{ zIndex: Z_LAYERS.modalPriority }}` in:
  - `/Users/nick/Designagency/src/app/components/CompletedProjectsPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/FeedbackPopup.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx` (loading fallback)

### 2) Tokenized color/surface outliers
- Added minimal new theme tokens and mapped colors in `/Users/nick/Designagency/src/styles/theme.css`:
  - `--accent-soft-bg`, `--accent-soft-bg-hover`, `--accent-soft-border`, `--accent-soft-border-strong`
  - `--control-surface-soft`, `--control-surface-muted`, `--control-dot-muted`
- Replaced one-off hardcoded accent/surface values in:
  - `/Users/nick/Designagency/src/app/components/Tasks.tsx`
  - `/Users/nick/Designagency/src/app/components/main-content/FileSection.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRow.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/AddTaskRow.tsx`
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`
  - `/Users/nick/Designagency/src/app/components/main-content/MenuIcon.tsx`

### 3) Shared dashboard chrome primitives
- Added `/Users/nick/Designagency/src/app/components/ui/dashboardChrome.ts` with shared constants for:
  - Search field container/border/content/icon/input
  - Icon trigger base/open/idle/accent states
- Applied these shared classes to:
  - `/Users/nick/Designagency/src/app/components/Tasks.tsx`
  - `/Users/nick/Designagency/src/app/components/ArchivePage.tsx`
  - `/Users/nick/Designagency/src/app/components/main-content/FileSection.tsx`
  - `/Users/nick/Designagency/src/app/components/CompletedProjectsPopup.tsx`

### 4) Sidebar pattern alignment
- Added `/Users/nick/Designagency/src/app/components/sidebar/sidebarChrome.ts` with shared sidebar trigger/item/badge classes.
- Migrated sidebar trigger/pill and item styling in:
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarProfileMenu.tsx`
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarWorkspaceSwitcher.tsx`
- Replaced non-token member avatar fallback gradient with tokenized fallback surface in:
  - `/Users/nick/Designagency/src/app/components/settings-popup/MemberRow.tsx`

### 5) Floating surface family unification
- Extended `/Users/nick/Designagency/src/app/components/ui/menuChrome.ts` with shared floating surface constants:
  - `FLOATING_SURFACE_BASE_CLASS`
  - `TOOLTIP_SURFACE_CLASS`
  - `CALENDAR_POPOVER_SURFACE_CLASS`
- Applied to:
  - `/Users/nick/Designagency/src/app/components/permissions/DeniedAction.tsx`
  - `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRows.tsx` (calendar popover)

### 6) Legacy component cleanup
- Deleted unused legacy component:
  - `/Users/nick/Designagency/src/app/components/SidebarHelpActions.tsx`
- Verified no references remain.

## Validation
- Ran lint:
  - `npm run lint`
  - Result: pass
- Ran requested frontend tests:
  - `npm run test:frontend -- src/app/components/Tasks.test.tsx src/app/components/ProjectTasks.test.tsx src/app/components/MainContent.test.tsx src/app/components/ArchivePage.test.tsx src/app/components/SearchPopup.test.tsx src/app/components/SettingsPopup.test.tsx src/app/components/CompletedProjectsPopup.test.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/components/Sidebar.test.tsx src/app/components/settings-popup/CompanyMembersSection.test.tsx src/app/components/FeedbackPopup.test.tsx src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx`
  - Result: pass

## Notes
- No backend/API interfaces were changed.
- Auth and marketing surfaces were intentionally excluded from this pass.
- Project status and logo branding semantics were preserved.
