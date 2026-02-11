# Preserve Scroll Position When Switching File Tabs

**Date:** 11-02-2026 11:33

## Summary
Fixed the project detail file-tab switch behavior where changing between `Assets`, `Contract`, and `Attachments` could jump the scroll container back to the top.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/MainContent.tsx`:
  - Added `handleSetActiveTab` wrapper that captures the current scroll offset from the main content scroll container and restores it after tab state updates.
  - Passed `handleSetActiveTab` into `FileSection` instead of raw `setActiveTab`.
- Updated `/Users/nick/Designagency/src/app/components/main-content/FileSection.tsx`:
  - Added `type="button"` to all file-tab buttons to avoid implicit submit behavior.
  - Removed the keyed wrapper (`key={projectId + "-" + activeTab}`) around rendered rows to avoid forced remount on every tab change.
  - Removed now-unused `projectId` prop from `FileSection`.
- Updated `/Users/nick/Designagency/src/app/components/main-content/FileSection.test.tsx`:
  - Removed obsolete `projectId` prop from test factory.
- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Added regression test verifying scroll position is preserved while switching file tabs.

## Validation
- Ran frontend tests:
  - `npm run test:frontend -- src/app/components/MainContent.test.tsx src/app/components/main-content/FileSection.test.tsx`
- Result: pass (`52` test files, `150` tests).
