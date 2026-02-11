# Integrity and Listener Hardening

**Date:** 11-02-2026 14:09

## Objective
Implement targeted safety and consistency fixes across WorkOS membership sync, chat sidebar listener lifecycle, and service name normalization.

## Changes Implemented

### 1) Fail-fast user integrity in organization membership sync
- Updated `/Users/nick/Designagency/convex/lib/workosOrganization.ts`:
  - `syncWorkspaceMemberFromOrganizationMembership` now validates `targetUser` immediately after `ctx.db.get(args.userId)`.
  - Added explicit error path:
    - `throw new Error(\`User not found: ${args.userId}\`)`
  - Removed silent placeholder fallback (`"Unknown user"`/empty values) for missing users.

### 2) Safe timeout lifecycle in chat comment add flow
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/useChatSidebarCommentActions.ts`:
  - Added `mountedRef` and `addCommentScrollTimerRef`.
  - Added unmount cleanup effect that:
    - sets `mountedRef.current = false`
    - clears pending timeout via `clearTimeout`.
  - Replaced bare `setTimeout` in `handleAddComment` with tracked timer id.
  - Guarded delayed `scrollRef.current?.scrollTo(...)` with `mountedRef.current`.

### 3) Bind scroll listener to live ref target
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/useChatSidebarCommentActions.ts`:
  - Changed hook call from `target: scrollRef.current` to `target: scrollRef`.
- Updated `/Users/nick/Designagency/src/app/lib/hooks/useGlobalEventListener.ts`:
  - `target` now accepts either an event target or a ref-like object with `.current`.
  - Hook resolves `target.current` at effect time and subscribes/unsubscribes against the resolved target.
  - Effect dependencies now include the resolved target to support rebinding when it changes.
- Updated `/Users/nick/Designagency/src/app/lib/hooks/useGlobalEventListener.test.ts`:
  - Added coverage for ref-based targets and rebinding when `ref.current` switches.

### 4) Product service title-case consistency
- Updated `/Users/nick/Designagency/src/app/lib/projectServices.ts`:
  - `CREATE_PROJECT_SERVICES`: `"Product design"` -> `"Product Design"`.
  - `SERVICE_JOB_CONFIG` key updated to `"Product Design"`.
  - `SERVICE_NAME_ALIASES` canonical value updated to `"Product Design"`.
- Updated `/Users/nick/Designagency/src/app/lib/projectServices.test.ts` expectations to `"Product Design"`.

### 5) Added backend regression test for missing user guard
- Updated `/Users/nick/Designagency/convex/__tests__/workspaces_workos_linking.test.ts`:
  - Added test asserting `syncWorkspaceMemberFromOrganizationMembership` rejects with `User not found: <id>` when the referenced user row is missing.

## Validation
- `npm run test:frontend -- src/app/lib/projectServices.test.ts src/app/lib/hooks/useGlobalEventListener.test.ts` ✅
- `npm run test:backend -- convex/__tests__/workspaces_workos_linking.test.ts` ✅
- `npm run typecheck` ✅
