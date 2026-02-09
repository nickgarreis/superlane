# Secret Rotation Runbook

## Scope

Rotate and validate secrets across:
- WorkOS
- Convex backend env vars
- Hosting/CI secret stores

## Rotation Targets

### WorkOS
- `WORKOS_CLIENT_ID`
- `WORKOS_API_KEY`
- `WORKOS_WEBHOOK_SECRET`
- `WORKOS_ACTION_SECRET`

### Frontend/Hosting
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_WORKOS_CLIENT_ID`
- `VITE_WORKOS_REDIRECT_URI`

### Convex
- All required backend vars from `convex/.env.example`

## Rotation Procedure

1. Generate/issue new WorkOS secrets in WorkOS dashboard.
2. Update Convex deployment env vars.
3. Update hosting/CI secret stores.
4. Keep old secrets active only during controlled overlap window.
5. Trigger backend and frontend deploy.

## Validation Commands

- `npm run security:env`
- `npm run security:urls`
- `npm run security:urls:strict`
- `npm run security:secrets`
- `npm run security:deps`
- `npm run security:check`

Expected results:
- All checks pass.
- Auth callback and webhook endpoints function with new secrets.

If validation fails:
- Revert to previous known-good secret set.
- Re-run checks.
- Re-attempt rotation after correcting config mismatch.

## Completion Checklist

- Old secrets revoked.
- Rotation date recorded in ops log.
- Incident channel notified with completion summary.
