# Dev Seed Convex Env Runtime Fix

**Date:** 11-02-2026 14:30

## Issue
`devSeed:reseed` returned:
- `Dev seeding is disabled...`

even though `DEV_SEED_ENABLED=true` existed in `convex/.env.example`.

## Root cause
- Convex function runtime environment variables come from Convex deployment env settings (`convex env`), not from the local template file `convex/.env.example`.

## Changes made
- Updated seed guard error message in `/Users/nick/Designagency/convex/devSeed.ts` to point to the correct setup command:
  - `npx convex env set DEV_SEED_ENABLED true`
- Updated docs wording in `/Users/nick/Designagency/docs/11-02-2026_14-16_dev-seed-cli-internal-approach.md` accordingly.

## Runtime fix applied
- Executed on dev deployment:
  - `npx convex env set DEV_SEED_ENABLED true`
- Verified:
  - `npx convex env get DEV_SEED_ENABLED` returned `true`.

## Validation
- Ran: `npm run seed:reseed -- '{"workspaceSlug":"nick-workspace"}'`
- Result: succeeded with seeded rows created.
- Ran: `npm run typecheck:backend` (pass).
