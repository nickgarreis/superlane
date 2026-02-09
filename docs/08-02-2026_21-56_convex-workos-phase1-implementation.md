# Convex + WorkOS Phase 1 Implementation (Core Migration)

## What Was Implemented
- Added full Convex backend scaffolding under `/Users/nick/Designagency/convex/`:
  - `convex.config.ts` with `@convex-dev/workos-authkit` component registration
  - `http.ts` with `authKit.registerRoutes(http)` webhook/action routes
  - `auth.config.ts` using WorkOS JWT providers from `authKit.getAuthConfigProviders()`
  - `auth.ts` with `AuthKit` initialization, WorkOS user event syncing (`authKitEvent`), and `getCurrentUser` query
  - `schema.ts` with phase-1 tables: `users`, `workspaces`, `workspaceMembers`, `projects`, `tasks` + indexes
  - `dashboard.ts`, `workspaces.ts`, `projects.ts`, `tasks.ts` with phase-1 query/mutation surface
  - `lib/auth.ts` and `lib/validators.ts` for shared auth checks and validators

## Frontend Migration Work
- Added WorkOS + Convex provider bridge:
  - `/Users/nick/Designagency/src/app/providers/ConvexProviderWithAuthKit.tsx`
- Updated app bootstrap in `/Users/nick/Designagency/src/main.tsx`:
  - Wraps app with `AuthKitProvider`
  - Wraps app with `ConvexProviderWithAuthKit`
  - Requires `VITE_CONVEX_URL`, `VITE_WORKOS_CLIENT_ID`, `VITE_WORKOS_REDIRECT_URI`
- Reworked `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
  - Replaced simulated login with real `signIn` / `signUp` calls via AuthKit
- Replaced local-auth/local-data `App.tsx` flow with Convex-powered flow:
  - Uses `AuthLoading`, `Authenticated`, `Unauthenticated`
  - Uses `api.dashboard.getSnapshot` as source-of-truth
  - Calls `ensureDefaultWorkspace` when authenticated user has no workspace
  - Routes UI operations through Convex mutations for workspace/project/task lifecycle
  - Keeps existing route/view format (e.g. `project:<publicId>`, `archive-project:<publicId>`)

## New Frontend Mapping Helpers
- Added `/Users/nick/Designagency/src/app/lib/status.ts` for status normalization/style mapping
- Added `/Users/nick/Designagency/src/app/lib/mappers.ts` for DB snapshot -> existing UI `ProjectData`/`Workspace` mapping
- Extended `/Users/nick/Designagency/src/app/types.ts` with DB-facing types and `ProjectStatus`

## Validation
- `npm run build` completes successfully after migration changes.

## Important Note
- `npx convex codegen` could not run in this environment due missing deployment configuration (`CONVEX_DEPLOYMENT`).
- Temporary fallback files were added under `/Users/nick/Designagency/convex/_generated/` to keep the codebase buildable now.
- Once a Convex deployment is configured, run:
  - `npx convex dev` (or `npx convex codegen` after setup)
  - then replace/overwrite those fallback `_generated` files with official generated outputs.
