# Inbox unread badge migrated to reusable SidebarTag with blue tokens

## Date
- 13-02-2026 09:50

## Goal
Use the reusable sidebar tag component for the inbox unread count badge and ensure it uses blue tokenized styling instead of warning/yellow styling.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`:
  - expanded tone union from `"approved"` to `"approved" | "inboxUnread"`.
  - added `inboxUnread` tone classes using blue tokens:
    - `txt-tone-accent`
    - `bg-accent-soft-bg`
    - `border-accent-soft-border`
  - included size/spacing alignment for the count badge:
    - `h-[20px] min-w-[20px] justify-center px-1.5 txt-role-meta`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - replaced `badge` rendering from old `SIDEBAR_BADGE_CLASS` span to:
    - `<SidebarTag tone="inboxUnread" className="ml-2">{badge}</SidebarTag>`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/sidebarChrome.ts`:
  - removed now-unused `SIDEBAR_BADGE_CLASS` export.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`:
  - added `inboxUnread` tone regression test.
  - verifies blue token classes and ensures warning/yellow class is absent.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx`:
  - asserts inbox unread tag has `data-sidebar-tag-tone="inboxUnread"` and `txt-tone-accent`.

- Updated `/Users/nick/Designagency/src/app/components/Sidebar.test.tsx`:
  - unread badge (`7`) and capped badge (`99+`) now assert `inboxUnread` tone + `txt-tone-accent` class.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx /Users/nick/Designagency/src/app/components/Sidebar.test.tsx` ✅
- `npx eslint /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx /Users/nick/Designagency/src/app/components/sidebar/sidebarChrome.ts /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.test.tsx /Users/nick/Designagency/src/app/components/Sidebar.test.tsx` ✅
- `npm run build` ✅
- build CSS spot-check confirmed blue token classes emitted:
  - `.txt-tone-accent{` ✅
  - `.bg-accent-soft-bg{` ✅
  - `.border-accent-soft-border{` ✅
