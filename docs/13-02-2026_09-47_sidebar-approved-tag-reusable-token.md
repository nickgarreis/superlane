# Sidebar approved tag migrated to reusable tokenized component

## Date
- 13-02-2026 09:47

## Goal
Fix the sidebar approved label showing as gray text by replacing the old warning-pill class path with a reusable sidebar tag component that uses explicit existing color/text tokens.

## What changed
- Added `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx`:
  - introduced reusable `SidebarTag` component with:
    - `type SidebarTagTone = "approved"`
    - `type SidebarTagProps = { tone: SidebarTagTone; children: React.ReactNode; className?: string }`
  - added shared base chrome classes:
    - `inline-flex h-[19px] items-center px-2 py-[2px] txt-role-kbd font-medium shrink-0 whitespace-nowrap rounded-full border`
  - mapped `approved` tone to existing tokens:
    - `txt-tone-warning`
    - `[background-color:var(--activity-collaboration-bg)]`
    - `[border-color:var(--activity-collaboration-border)]`
  - added deterministic hook `data-sidebar-tag-tone={tone}`.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - removed `WARNING_STATUS_PILL_CLASS` usage.
  - replaced approved tag rendering with:
    - `<SidebarTag tone="approved" className="ml-2">Approved</SidebarTag>`
  - left Draft/In Review rendering unchanged.

- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - removed unused `WARNING_STATUS_PILL_CLASS` export.
  - kept `IMPORTANT_STATUS_PILL_CLASS` and all other chrome constants unchanged.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProjectsSection.test.tsx`:
  - preserved existing approved-visibility behavior coverage.
  - added assertions that the approved badge includes:
    - `data-sidebar-tag-tone="approved"`
    - `txt-tone-warning`.

- Added `/Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx`:
  - verifies approved text renders.
  - verifies base tag classes render.
  - verifies approved tone classes and data attribute render.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/sidebar/SidebarProjectsSection.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx` ✅
- `npx eslint /Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarProjectsSection.test.tsx /Users/nick/Designagency/src/app/components/sidebar/SidebarTag.test.tsx` ✅
- `npm run build` ✅
