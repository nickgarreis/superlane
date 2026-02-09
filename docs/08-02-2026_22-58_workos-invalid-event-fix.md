# WorkOS Invalid Event Name Fix (`organization_membership.added`)

## Issue
Running `npx convex dev` failed repeatedly in the WorkOS AuthKit event updater with:

- `Invalid name parameter, received: 'organization_membership.added'. You must pass in valid event names`

The error came from the `events.listEvents` call used by `@convex-dev/workos-authkit` when it receives the configured `additionalEventTypes`.

## Root Cause
`/Users/nick/Designagency/convex/auth.ts` configured unsupported event names for this WorkOS events listing path:
- `organization_membership.added`
- `organization_membership.removed`

Those names caused `lib:updateEvents` to throw before processing events.

## Changes Made
Updated `/Users/nick/Designagency/convex/auth.ts`:

1. Removed unsupported additional event types from `AuthKit` config:
- removed `organization_membership.added`
- removed `organization_membership.removed`

2. Removed matching event handlers that were tied to those names:
- removed `"organization_membership.added"` handler
- removed `"organization_membership.removed"` handler

Kept valid membership/org handlers:
- `organization_membership.created`
- `organization_membership.updated`
- `organization_membership.deleted`
- `organization.deleted`

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
- `npx convex dev` soak run after patch ✅
  - Convex functions prepared successfully.
  - No recurring `Invalid name parameter` errors observed during the soak window.

## Result
Convex dev no longer crashes in `lib:updateEvents` due to invalid WorkOS event names, and membership synchronization remains active via supported organization membership events.
