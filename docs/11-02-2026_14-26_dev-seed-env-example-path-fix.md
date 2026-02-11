# Dev Seed Env Example Path Fix

**Date:** 11-02-2026 14:26

## What changed
- Updated dev seed guard error messaging in `/Users/nick/Designagency/convex/devSeed.ts`.
- The message now points to `convex/.env.example` instead of `convex/.env` when `DEV_SEED_ENABLED` is not enabled.

## Why
- This repository uses `convex/.env.example` as the environment template path, so the previous message was misleading.

## Validation
- Ran `npm run typecheck:backend` after the change.
