# Project activity uses project logo icon

## Date
- 12-02-2026 15:57

## Goal
Fix project activity type icon so it uses the project image/logo style (as in search popup) instead of the brand-assets/palette icon.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - added optional `kindIcon` slot so rows can provide a custom activity-type icon
  - default icon behavior for non-custom kinds remains unchanged

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`:
  - project activity rows now pass `kindIcon={<ProjectLogo ... />}`
  - `ProjectLogo` uses project category when available and falls back to the default project SVG mark

- Updated `/Users/nick/Designagency/convex/activities.ts`:
  - enriched activity feed response with `projectCategory` by resolving `projectPublicId` against `projects` in the same workspace
  - returned `projectCategory` in each mapped activity payload so frontend can render project-specific imagery

- Updated `/Users/nick/Designagency/src/app/types.ts`:
  - added optional `projectCategory?: string | null` on `WorkspaceActivity`

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - added regression check ensuring project activity type icon is not `lucide-palette`

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ProjectActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/types.ts convex/activities.ts` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npm run typecheck` ✅
