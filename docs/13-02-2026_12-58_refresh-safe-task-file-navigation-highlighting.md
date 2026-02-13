# Refresh-safe task/file navigation highlighting

## Date
- 13-02-2026 12:58

## Goal
- Ensure task and file navigation highlights from Search/Inbox still scroll + flash after a hard refresh.
- Prevent highlight intent from being consumed before project rows mount.

## What changed

### Retryable highlight intent pipeline
- Updated `/Users/nick/Designagency/src/app/components/main-content/useMainContentHighlighting.ts`:
  - Added stable, primitive-based pending-intent keys for task/file highlights.
  - Added per-intent data-resolution timeout (5s) with one terminal toast on failure.
  - Added intent lifecycle refs to avoid unnecessary rerenders and stale closure issues.
  - Task intents now wait for task data before triggering row highlight.
  - File intents now wait for file data before triggering row highlight.
  - Pending highlight is now cleared only after highlight lifecycle resolves (`applied` or `missing`).
  - File row mount now polls for up to 2s (50ms interval) before failing.
  - Exposed `highlightedFileId` for virtualized file-list targeting.

### Task highlight completion contract
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/useTaskHighlight.ts`:
  - Added row-mount polling (2s max, 50ms interval).
  - Added structured completion callback payload: `{ status: "applied" | "missing" }`.
  - Preserved smooth scroll + flash animation behavior.

- Updated `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`:
  - Updated `onHighlightDone` prop type to receive highlight result payload.
  - Forwarded `highlightedTaskId` into task rows for virtualization-aware scroll targeting.

### Virtualization-aware targeting
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRows.tsx`:
  - Added `highlightedTaskId` prop.
  - Added `scrollToIndex(..., { align: "center" })` when the task list is virtualized.

- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`:
  - Added `highlightedFileId` prop.
  - Added `scrollToIndex(..., { align: "center" })` when the file list is virtualized.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.tsx`:
  - Threaded `highlightedFileId` from highlighting hook into `MainContentFileRows`.

## Tests added/updated
- Added `/Users/nick/Designagency/src/app/components/project-tasks/useTaskHighlight.test.tsx`.
- Added `/Users/nick/Designagency/src/app/components/main-content/useMainContentHighlighting.test.tsx`.
- Added `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRows.test.tsx`.
- Added `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.test.tsx`.
- Updated `/Users/nick/Designagency/src/app/components/ProjectTasks.test.tsx` for timeout-based and delayed-mount highlight behavior.
- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx` for delayed file-highlight clear timing.

## Validation
- `npx vitest run src/app/components/project-tasks/useTaskHighlight.test.tsx src/app/components/main-content/useMainContentHighlighting.test.tsx src/app/components/ProjectTasks.test.tsx src/app/components/project-tasks/ProjectTaskRows.test.tsx src/app/components/main-content/MainContentFileRows.test.tsx` ✅
- `npm run test:frontend` ✅
- `npm run typecheck` ✅
- `npm run lint` ⚠️
  - ESLint passed.
  - Repo quality gate failed due pre-existing oversized files:
    - `src/app/dashboard/useDashboardNavigation.ts`
    - `convex/activities.ts`
