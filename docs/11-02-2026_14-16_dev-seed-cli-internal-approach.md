# Dev Seed CLI/Internal Approach

**Date:** 11-02-2026 14:16

## What was implemented
- Added a new Convex seeding module at `/Users/nick/Designagency/convex/devSeed.ts` with workspace-scoped, development-only seed operations:
  - `devSeed:apply`
  - `devSeed:reset`
  - `devSeed:reseed`
- Added strict runtime guardrails:
  - Seeding is blocked unless `DEV_SEED_ENABLED=true` is set via `npx convex env set DEV_SEED_ENABLED true` on the target deployment.
  - Seeding is blocked if `CONVEX_DEPLOYMENT` contains `prod`.
- Added deterministic namespace-based seed identifiers so seeded rows are easy to remove and safe to target:
  - `dev-seed-<workspace-slug>-<profile>-...`
- Added two profiles:
  - `minimal`
  - `full` (default)

## Seed scope
The seed generator now creates workspace-scoped demo data for:
- users + workspace members (active/invited mix)
- projects (active/review/draft/completed/archived coverage)
- tasks (project tasks + workspace-level tasks)
- files metadata rows across tabs (Assets/Contract/Attachments)
- threaded comments + reactions
- pending invitation (full profile)

## Reset behavior
`devSeed:reset` removes only rows matching the deterministic seed namespace for the target workspace/profile, including cleanup across:
- workspace members/users created by seed
- projects/tasks/files/comments/reactions
- pending uploads and invitations created by seed
- optional related notification preference and WorkOS membership cache rows when prefixed

## CLI integration
Added npm scripts in `/Users/nick/Designagency/package.json`:
- `seed:apply` -> `convex run devSeed:apply`
- `seed:reset` -> `convex run devSeed:reset`
- `seed:reseed` -> `convex run devSeed:reseed`

Example usage:
- `npm run seed:apply -- '{"workspaceSlug":"your-workspace-slug"}'`
- `npm run seed:apply -- '{"workspaceSlug":"your-workspace-slug","profile":"minimal"}'`
- `npm run seed:reset -- '{"workspaceSlug":"your-workspace-slug"}'`

## Validation
- Ran `npm run typecheck:backend` successfully after implementation.
