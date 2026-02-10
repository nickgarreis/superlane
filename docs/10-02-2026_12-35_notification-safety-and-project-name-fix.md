# Notification Logging + Project Name Scheduling + React Types Alignment

**Date:** 10-02-2026 12:35

## Scope
Implemented three requested fixes:
- Removed raw recipient email from enqueue failure logs in notification dispatch.
- Ensured project lifecycle notification scheduling uses the post-update project name when a rename and status change happen in one mutation.
- Updated React type package versions to match React runtime peer dependency version.

## Changes

- `convex/notificationsEmail.ts`
  - In the enqueue catch block, removed `recipientEmail` from `console.error` payload.
  - Kept `recipientUserId`, `toggle`, and `error` context fields.

- `convex/projects.ts`
  - In `projects.update`, added `const updatedName = args.name ?? project.name;` before scheduling lifecycle notifications.
  - Updated `scheduleProjectLifecycleNotification` payload to use `projectName: updatedName`.
  - Preserved `previousStatus: project.status` and `nextStatus: args.status`.

- `package.json`
  - Updated dev dependencies:
    - `@types/react`: `18.2.0` -> `18.3.1`
    - `@types/react-dom`: `18.2.0` -> `18.3.1`

## Validation
- `npm run lint -- convex/notificationsEmail.ts convex/projects.ts` ✅
- `npm run typecheck:backend` ✅
- `npm run typecheck` ❌ (frontend TypeScript errors exist in multiple UI files; outside this backend/security change scope)
