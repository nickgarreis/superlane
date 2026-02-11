# Dev Seed Profile Expansion

**Date:** 11-02-2026 14:37

## What changed
- Expanded the full dev seed profile in `/Users/nick/Designagency/convex/devSeed.ts` to provide substantially richer test data.

## Project changes
- Increased full-profile seeded projects from 5 to 12.
- Added 7 new projects total:
  - +3 completed projects
  - +2 archived projects
  - +2 active projects
- Extended every seeded project description to be significantly longer and more realistic for UI and search testing.

## Task changes
- Reworked task generation to be project-driven.
- Every seeded project now receives multiple tasks.
- Full profile now seeds 4 tasks per project (max <= 5 per project).
- Minimal profile now seeds 3 tasks per project.

## File changes
- Reworked file generation to be project-driven.
- Added multiple files per project across tabs (`Assets`, `Contract`, `Attachments`).
- Full profile now seeds 3 files per project.
- Minimal profile now seeds 2 files per project.

## Validation
- Ran `npm run typecheck:backend` (pass).
- Ran `npm run seed:reseed -- '{"workspaceSlug":"nick-workspace"}'`.
- Observed full-profile seed counts:
  - projects: 12
  - tasks: 48
  - files: 36
