# Inbox container left shadow removed

## Date
- 12-02-2026 16:22

## Goal
Remove the left-cast shadow from the inbox container.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - replaced `shadow-2xl` on the inbox panel shell with a directional right-side shadow class (`shadow-[16px_0_28px_-20px_rgba(0,0,0,0.75)]`)
  - this removes the shadow spill on the left edge while keeping depth on the outer side of the panel

## Validation
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ❌
  - failing assertion: duplicate match for `Finalize homepage copy` in `src/app/components/InboxSidebarPanel.test.tsx:108`
