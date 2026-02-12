# Remove inbox subtitle text

**Date:** 12-02-2026 12:52

## What changed
- Removed the sentence `Workspace activity log from this release onward.` from the inbox panel.
- Kept spacing/layout by leaving the search/filter block as the first content row under the header.

## Files updated
- `src/app/components/InboxSidebarPanel.tsx`

## Validation
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx` ✅
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
