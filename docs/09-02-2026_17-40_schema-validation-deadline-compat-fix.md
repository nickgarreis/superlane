# Schema Validation Fix: Legacy `deadline` Compatibility + Cleanup

## Problem
Convex schema validation failed for `projects` rows containing legacy date fields (for example, top-level `deadline`) after the date-contract migration to canonical epoch-ms fields.

## What Changed

### 1) Added legacy compatibility fields to validators/schema
Updated the Convex validators and table schema to temporarily accept old date keys so existing rows no longer fail validation immediately:

- `projects.deadline` (legacy)
- `tasks.dueDate` (legacy)
- `projectFiles.displayDate` (legacy)
- `workspaceBrandAssets.displayDate` (legacy)
- `projects.draftData.deadline` (legacy)
- `projects.attachments[].date` (legacy)

Files:
- `/Users/nick/Designagency/convex/schema.ts`
- `/Users/nick/Designagency/convex/lib/validators.ts`

### 2) Strengthened normalization migration to remove legacy keys
Updated date normalization planning/apply logic to strip old keys while preserving/setting canonical epoch fields:

- Removes `projects.deadline`
- Removes `tasks.dueDate`
- Removes `projectFiles.displayDate`
- Removes `workspaceBrandAssets.displayDate`
- Existing nested cleanup retained for `draftData.deadline` and `attachments[].date`

File:
- `/Users/nick/Designagency/convex/dateNormalization.ts`

### 3) Added cleanup-on-touch for project updates
When projects are patched through project mutations, legacy `deadline` is now explicitly removed.

File:
- `/Users/nick/Designagency/convex/projects.ts`

### 4) Added regression coverage
Added a new test that inserts legacy fields, runs normalization, and verifies legacy keys are removed and canonical values remain.

File:
- `/Users/nick/Designagency/convex/__tests__/date_normalization.test.ts`

## Validation
- `npm run typecheck` ✅
- `npx vitest run convex/__tests__/date_normalization.test.ts` ✅
- `npm run build` ✅
- `npm run lint` ✅

## Operational Note
To clean existing persisted legacy rows in your Convex deployment, run the normalization action after deploying these changes.
