# P2.1 Date/Time Contract Normalization (Implemented)

## Summary
Implemented the P2.1 normalization stream end-to-end with canonical epoch-ms contracts across backend and frontend.

## Backend Changes

### Canonical schema/contracts
- Updated `/Users/nick/Designagency/convex/schema.ts`:
  - `projects.deadlineEpochMs` (optional number/null)
  - `tasks.dueDateEpochMs` (optional number/null)
  - `projectFiles.displayDateEpochMs` (number)
  - `workspaceBrandAssets.displayDateEpochMs` (number)
- Added date indexes:
  - `projects.by_workspace_deadlineEpochMs`
  - `tasks.by_project_dueDateEpochMs`
  - `tasks.by_workspace_dueDateEpochMs`
  - `projectFiles.by_workspace_displayDateEpochMs`
  - `workspaceBrandAssets.by_workspace_deletedAt_displayDateEpochMs`

### Validator updates
- Updated `/Users/nick/Designagency/convex/lib/validators.ts`:
  - task input now uses `dueDateEpochMs`
  - draft data now uses `deadlineEpochMs`
  - attachment mirror now uses `dateEpochMs`

### Shared normalization utilities
- Added `/Users/nick/Designagency/convex/lib/dateNormalization.ts`:
  - UTC-noon date-only anchor conversion
  - legacy parsers for project deadline (`ISO`, `dd.MM.yy`, `dd.MM.yyyy`)
  - legacy parser for task due date (`ISO` or `MMM d` with created-year inference)
  - display-date parser for datetime fields

### Write-path canonicalization
- Updated:
  - `/Users/nick/Designagency/convex/projects.ts`
  - `/Users/nick/Designagency/convex/tasks.ts`
  - `/Users/nick/Designagency/convex/files.ts`
  - `/Users/nick/Designagency/convex/settings.ts`
  - `/Users/nick/Designagency/convex/lib/projectAttachments.ts`
- All date writes now persist canonical epoch fields.

### Migration actions (preview/apply)
- Added `/Users/nick/Designagency/convex/dateNormalization.ts`:
  - `previewDateNormalization`
  - `applyDateNormalization`
  - internal auth check (authenticated caller required)
  - batch processing + parse-failure counts/samples
  - idempotent patch behavior

## Frontend Changes

### Shared date helpers
- Added `/Users/nick/Designagency/src/app/lib/dates.ts`:
  - UTC-noon conversion helpers
  - consistent display formatters
  - undated-last comparator

### Epoch-first app contracts
- Updated:
  - `/Users/nick/Designagency/src/app/types.ts`
  - `/Users/nick/Designagency/src/app/lib/mappers.ts`
  - `/Users/nick/Designagency/src/app/App.tsx`
- Project/task/file flows now use epoch fields:
  - `deadlineEpochMs`
  - `dueDateEpochMs`
  - `displayDateEpochMs`

### UI consumers moved to helper formatting
- Updated:
  - `/Users/nick/Designagency/src/app/components/CreateProjectPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
  - `/Users/nick/Designagency/src/app/components/Tasks.tsx`
  - `/Users/nick/Designagency/src/app/components/MainContent.tsx`
  - `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/ChatSidebar.tsx`
  - `/Users/nick/Designagency/src/app/components/ArchivePage.tsx`
  - `/Users/nick/Designagency/src/app/components/CompletedProjectsPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`
- Task due-date sorting now places undated tasks last.

## Test Coverage

### New tests
- Added `/Users/nick/Designagency/convex/__tests__/date_normalization.test.ts`:
  - parser coverage
  - preview/apply migration behavior
  - idempotency
  - auth requirement
- Added `/Users/nick/Designagency/src/app/lib/dates.test.ts`:
  - UTC-noon round-trip
  - display-format consistency
  - undated-last comparator behavior

### Updated tests
- Updated:
  - `/Users/nick/Designagency/convex/__tests__/rbac.test.ts`
  - `/Users/nick/Designagency/convex/__tests__/file_storage.test.ts`
  - `/Users/nick/Designagency/convex/__tests__/collaboration_identity.test.ts`

## Tooling
- Updated `/Users/nick/Designagency/vitest.config.ts` to include frontend utility tests under `src/app/lib/**/*.test.ts`.
- Regenerated Convex bindings (`/Users/nick/Designagency/convex/_generated/api.d.ts`).

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:rbac` ✅
- `npx vitest run src/app/lib/dates.test.ts` ✅
- `npm run build` ✅
