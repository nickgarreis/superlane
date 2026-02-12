# Inbox activity records redesign

## Date
- 12-02-2026 15:31

## Goal
Improve inbox/activity UX by addressing:
- raw JSON payloads shown directly in activity rows
- horizontal overflow causing side-scroll inside inbox
- unread row contrast/readability issues
- unlabeled entity values (project/task/file/member names)

## What changed
- Updated shared activity formatting utilities:
  - `/Users/nick/Designagency/src/app/components/activities-page/activityFormatting.ts`
  - added reusable `buildContextItems()` for labeled context badges
  - added structured message parsing (`formatActivityMessage`) for JSON payloads
  - updated metadata format to `By {actor} • {relative time}`

- Redesigned shared activity row shell:
  - `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`
  - stronger unread treatment (accent background + left accent rail + stronger unread dot)
  - added labeled context badge rendering for entity/value pairs
  - ensured long content wraps safely with `overflow-wrap:anywhere`

- Hardened row layout to prevent width overflow:
  - `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`
  - row base now enforces `w-full`, `min-w-0`, and `overflow-x-hidden`
  - type badge sizing adjusted to be less width-rigid

- Prevented horizontal scrolling in inbox container:
  - `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`
  - added `overflow-x-hidden` to scroll region
  - aligned header "Type" column width with updated badge sizing

- Added explicit, labeled context badges across row renderers:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

- Reworked organization sync payload display:
  - `organization_membership_sync` JSON payload now renders as labeled values (`Imported`, `Synced`, `Removed`) instead of raw JSON text
  - retained plain text fallback for non-JSON messages

- Updated tests:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`
  - added coverage for JSON payload formatting into labeled values
  - adjusted due-date assertion to support repeated rendered date values from new context badges

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/activities-page/activityFormatting.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/rows/ProjectActivityRow.tsx src/app/components/activities-page/rows/TaskActivityRow.tsx src/app/components/activities-page/rows/FileActivityRow.tsx src/app/components/activities-page/rows/MembershipActivityRow.tsx src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/WorkspaceActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.tsx` ✅
