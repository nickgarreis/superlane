# Resend Integration + Notification Toggles Implementation

**Date:** 10-02-2026 12:29

## Scope
Implemented Convex Resend-powered notification emails and replaced legacy notification channel settings with three user-scoped event toggles:
- Event Notifications
- Team Activities
- Product Updates

Desktop Channel was removed from settings.

## Backend changes

### Resend component integration
- Added dependency: `@convex-dev/resend`.
- Updated `convex/convex.config.ts` to register the Resend component alongside WorkOS.
- Added `convex/notificationsEmail.ts` with:
  - shared recipient filtering by workspace membership + user preferences
  - Resend sender setup (`testMode: false`)
  - webhook event handler (`handleEmailEvent`)
  - internal dispatch mutations:
    - `sendTeamActivityForComment`
    - `sendProjectLifecycleEvent`
    - `sendProductUpdateBroadcastInternal`
  - admin-only manual mutation:
    - `sendProductUpdateBroadcast`
  - resend cleanup mutation:
    - `cleanupResend`
- Updated `convex/http.ts` with `POST /resend-webhook` routed to `resend.handleResendEventWebhook`.
- Updated `convex/crons.ts` with hourly resend cleanup scheduling.

### Notification preference model migration
- Added `convex/lib/notificationPreferences.ts`:
  - default event preferences
  - backward-compatible normalization from legacy fields (`channels.email`, `events.teamActivity`).
- Updated `convex/schema.ts` notification preferences:
  - `events` now supports new shape (`eventNotifications`, `teamActivities`, `productUpdates`) with legacy union compatibility.
  - `channels` made optional for transitional compatibility.
- Updated `convex/settings.ts`:
  - `getNotificationPreferences` now returns `{ events, exists }`.
  - `saveNotificationPreferences` now accepts only new `events` shape.
  - legacy channels are cleared on save.

### Notification triggers
- Updated `convex/comments.ts`:
  - `comments.create` schedules team activity email dispatch.
- Updated `convex/projects.ts`:
  - project lifecycle transitions schedule event notifications:
    - submitted (`-> Review`)
    - review approved (`Review -> Active`)
    - completed (`-> Completed`)
- Scheduling uses delayed async dispatch to keep user mutations non-blocking.

## Frontend changes
- Updated notification settings types and payload contracts:
  - `src/app/components/settings-popup/types.ts`
  - `src/app/dashboard/types.ts`
  - `src/app/dashboard/useDashboardCommands.ts`
  - `src/app/dashboard/useDashboardWorkspaceActions.ts`
  - `src/app/dashboard/hooks/useDashboardSettingsData.ts`
- Updated `src/app/components/settings-popup/NotificationsTab.tsx`:
  - removed Desktop Channel row
  - now renders:
    - Event Notifications
    - Team Activities
    - Product Updates

## Environment + security contract
- Updated `convex/.env.example`:
  - `RESEND_API_KEY`
  - `RESEND_WEBHOOK_SECRET`
  - `NOTIFICATIONS_FROM_EMAIL`
- Updated required env matrix and validation:
  - `config/security/environment-matrix.json`
  - `scripts/security/check-env.mjs`
  - `docs/operations/environment-matrix.md`

## Tests added/updated
- Added backend tests: `convex/__tests__/notifications_email.test.ts`
  - recipient filtering + toggle gating
  - admin-only product update broadcast
  - scheduling assertions for comment/status trigger paths
- Updated backend settings tests: `convex/__tests__/settings_p11.test.ts`
  - new events shape round-trip
  - legacy compatibility normalization
- Added frontend test: `src/app/components/settings-popup/NotificationsTab.test.tsx`
  - verifies three toggles and save payload

## Validation
- `npm run lint` ✅
- `npm run typecheck:backend` ✅
- `npm run test:backend` ✅
- `npm run test:frontend` ✅
- `npm run security:check` ✅
- `npm run typecheck` ❌ (fails in pre-existing frontend strict type issues outside this change set)
