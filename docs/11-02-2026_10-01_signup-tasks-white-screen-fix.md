# Signup /tasks White Screen Fix

**Date:** 11-02-2026 10:01

## Issue
Newly created accounts could land on a blank screen at `/tasks` until a manual reload.

## Root Cause
`useDashboardData` derived `resolvedWorkspaceSlug` as:
- `snapshot?.activeWorkspaceSlug ?? activeWorkspaceSlug ?? null`

When bootstrap resolved for a first-time user with no workspace yet (`activeWorkspaceSlug: null`), the hook still fell back to a stale persisted `activeWorkspaceSlug` from local state/storage. That stale slug triggered workspace-scoped queries before provisioning completed, which could fail and leave the app in a broken first render.

## Changes
- Updated `src/app/dashboard/useDashboardData.ts`:
  - `resolvedWorkspaceSlug` now only falls back to `activeWorkspaceSlug` while bootstrap is still unresolved (`snapshot === undefined`).
  - Once bootstrap resolves, it trusts bootstrap (`snapshot.activeWorkspaceSlug ?? null`) and does not reuse stale local slug.
  - Workspace slug sync effect now reconciles both directions, including clearing stale local slug to `null` when bootstrap has no active workspace.

- Added regression test in `src/app/dashboard/useDashboardData.test.tsx`:
  - `ignores stale persisted workspace slug when bootstrap resolves with no active workspace`
  - Verifies stale slug is not used for workspace queries and local slug is reset to `null`.

## Validation
- Ran: `npm test -- src/app/dashboard/useDashboardData.test.tsx`
- Result: all tests passed.
