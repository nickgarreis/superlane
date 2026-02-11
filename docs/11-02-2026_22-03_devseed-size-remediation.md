# Dev Seed Size Remediation

**Date:** 11-02-2026 22:03

## Goal
Reduce `/Users/nick/Designagency/convex/devSeed.ts` below the feature-file-size hard gate (`500` lines) without changing public mutation endpoints or seed behavior.

## Changes
- Refactored `/Users/nick/Designagency/convex/devSeed.ts` into a thin entrypoint that only:
  - resolves seed context,
  - enforces dev-seed guardrails,
  - exports `apply`, `reset`, and `reseed` mutations.
- Added `/Users/nick/Designagency/convex/devSeedShared.ts`:
  - shared types,
  - namespace/prefix helpers,
  - guard + workspace lookup,
  - checksum + storage cleanup helpers.
- Added `/Users/nick/Designagency/convex/devSeedBlueprints.ts`:
  - user/project/task/file blueprint builders.
- Added `/Users/nick/Designagency/convex/devSeedReset.ts`:
  - seeded-row discovery and cleanup (`deleteSeedRows`).
- Added `/Users/nick/Designagency/convex/devSeedApply.ts`:
  - seeded data creation flow (`applySeedRows`), including users, projects, tasks, files, comments, reactions, invitations, and attachment mirror sync.

## Validation
- `node scripts/quality/check-feature-file-size.mjs` ✅
  - `Feature file size check passed.`
- `npm run lint` ✅
  - all lint checks passed; only existing component-size warnings remain.
- `npm run typecheck:backend` ✅

## Outcome
- `convex/devSeed.ts` is now below the 500-line gate and no longer blocks lint checks.
- Public seed command surface remains unchanged:
  - `devSeed:apply`
  - `devSeed:reset`
  - `devSeed:reseed`
