# Rollback Playbook

## Scope

Separate rollback paths for frontend and backend.

## Frontend Rollback (Vercel)

1. Identify last known-good deployment in Vercel.
2. Promote/redeploy that version.
3. Verify production routes:
   - `/`
   - `/login`
   - `/tasks`

Expected result:
- Previous UI behavior restored.

If rollback fails:
- Use CLI to redeploy known-good commit:
  - `git checkout <known-good-sha>`
  - `npm ci && npm run build`
  - `npx vercel --prod`

## Backend Rollback (Convex)

1. Identify last known-good backend commit.
2. Re-deploy Convex from known-good revision:
   - `git checkout <known-good-sha>`
   - `npm ci`
   - `npm run convex:deploy`

Expected result:
- Convex functions/schema return to known-good behavior.

If backend rollback is blocked by schema/migration drift:
- Execute compensating migration rollback in controlled steps.
- Verify data integrity before reopening write paths.

## Combined Rollback Order

When both layers are affected:
1. Roll back backend first if errors are mutation/query failures.
2. Roll back frontend second to align UI contracts.
3. Re-run smoke checks.

## Verification Checklist

- `npm run security:check`
- `npm run perf:check`
- Auth flow healthy
- Core CRUD paths healthy

Document rollback in a dated `docs/` entry with root cause and follow-up fixes.
