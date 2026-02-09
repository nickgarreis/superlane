# WorkOS Webhook Event Alignment

## Scope
Aligned Convex WorkOS event subscriptions with the webhook event set:
- user.created
- user.updated
- user.deleted
- organization_membership.created
- organization_membership.deleted
- organization_membership.updated
- organization.deleted
- organization.created
- organization.updated

## Changes Made
Updated `/Users/nick/Designagency/convex/auth.ts`:

1. Extended `additionalEventTypes` to include:
- `organization.created`
- `organization.updated`

2. Added handlers for organization lifecycle events:
- `organization.created`
- `organization.updated`

3. Added helper `syncOrganizationNameEvent(...)` to keep synced organization names in `workosOrganizationMemberships` current when org metadata changes.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
- `npx convex dev` soak run ✅
  - functions loaded successfully
  - no recurring `Invalid name parameter` errors observed

## Result
The backend now listens to and handles the full webhook event set you listed, while keeping the prior invalid-event crash fixed.
