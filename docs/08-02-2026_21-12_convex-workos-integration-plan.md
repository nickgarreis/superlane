# Convex Backend + WorkOS AuthKit Migration Plan (2-Phase, Core-First)

## Summary
Current state is fully client-side (`/Users/nick/Designagency/src/app/App.tsx`) with local auth (`isAuthenticated`), hardcoded workspaces/projects, and partial local-only features (notably chat and file uploads).
Planned target is:
1. Convex as the source of truth for workspace/project/task lifecycle.
2. WorkOS AuthKit + Convex auth for real authentication.
3. Core features shipped in phase 1, with chat and richer file handling in phase 2.

This plan uses selected defaults:
1. `2-phase core-first`
2. `org-per-workspace` with `soft mapping` in phase 1
3. `metadata now, storage later` for files
4. `start with empty database`
5. `defer chat to phase 2`

## Phase 1: Core Migration (Auth + Workspaces + Projects + Tasks)

1. Install and configure platform dependencies.
- Add deps: `convex`, `@convex-dev/workos-authkit`, `@workos-inc/authkit-react`, `@convex-dev/workos`.
- Add scripts in `/Users/nick/Designagency/package.json`: `convex:dev`, `convex:deploy`.
- Keep Vite app structure unchanged.

2. Add Convex auth/component wiring.
- Create `/Users/nick/Designagency/convex/convex.config.ts` and register `@convex-dev/workos-authkit`.
- Create `/Users/nick/Designagency/convex/http.ts` and register routes from `authKit.registerRoutes(http)`.
- Create `/Users/nick/Designagency/convex/auth.config.ts` with WorkOS JWT provider config.
- Create `/Users/nick/Designagency/convex/auth.ts`:
  - instantiate `AuthKit`.
  - export `authKitEvent` handlers for user create/update/delete to keep app `users` table in sync.
  - export `getCurrentUser` helper query using `authKit.getAuthUser(ctx)`.

3. Define phase-1 schema in `/Users/nick/Designagency/convex/schema.ts`.
- `users`: app user profile keyed by WorkOS user id.
- `workspaces`: app workspace entity with optional `workosOrganizationId` (soft mapping).
- `workspaceMembers`: access control table (role + status).
- `projects`: normalized project records with `publicId`, `workspaceId`, status enum, archive/completion timestamps, draft payload, review comments.
- `tasks`: separate table keyed by `projectId` and `workspaceId` for cross-project task views.
- Add indexes for:
  - membership checks (`workspaceMembers` by user and by workspace+user),
  - project lookup (`projects` by `publicId`, by `workspaceId`, by `workspaceId+status`, by `workspaceId+archived`),
  - task lookup (`tasks` by `projectId`, by `workspaceId`).

4. Add backend access-control helpers.
- Create `/Users/nick/Designagency/convex/lib/auth.ts` with:
  - `requireAuthUser(ctx)` via `authKit.getAuthUser`.
  - `requireWorkspaceMember(ctx, workspaceId)`.
- All queries/mutations must validate membership server-side before returning/mutating workspace data.

5. Implement phase-1 Convex functions.
- `/Users/nick/Designagency/convex/dashboard.ts`:
  - `getSnapshot({ activeWorkspaceSlug? })` query returning viewer + workspace list + active workspace + projects + tasks for that workspace.
- `/Users/nick/Designagency/convex/workspaces.ts`:
  - `create`, `update`, `switch` (if needed by slug), `ensureDefaultWorkspace`.
- `/Users/nick/Designagency/convex/projects.ts`:
  - `create`, `update`, `setStatus`, `archive`, `unarchive`, `remove`, `updateReviewComments`.
- `/Users/nick/Designagency/convex/tasks.ts`:
  - `replaceForProject` (project page updates),
  - `bulkReplaceForWorkspace` (tasks page multi-project updates).

6. Frontend provider/auth integration.
- Update `/Users/nick/Designagency/src/main.tsx` to wrap app with:
  - `AuthKitProvider(clientId, redirectUri)`,
  - `ConvexProviderWithAuthKit`.
- Add `/Users/nick/Designagency/src/app/providers/ConvexProviderWithAuthKit.tsx` (template-style bridge using `ConvexProviderWithAuth` + WorkOS `useAuth`).
- Replace local auth gate in `/Users/nick/Designagency/src/app/App.tsx` with Convex auth primitives:
  - `AuthLoading`, `Authenticated`, `Unauthenticated`.
- Refactor `/Users/nick/Designagency/src/app/components/AuthPage.tsx` to call WorkOS `signIn/signOut` instead of simulated login.

7. Replace local data state with Convex snapshot + mutations.
- Remove hard dependency on `INITIAL_PROJECTS` and `WORKSPACES` in `/Users/nick/Designagency/src/app/App.tsx`.
- Keep UI-only state local (`currentView`, popups, sidebar, highlight state).
- Add mapping helpers (for example `/Users/nick/Designagency/src/app/lib/status.ts`, `/Users/nick/Designagency/src/app/lib/mappers.ts`) so DB status enum maps to existing `ProjectData.status` color object without redesigning current components.
- Keep route format `project:<publicId>` and `archive-project:<publicId>` stable.

8. Bootstrap behavior for empty DB.
- On first authenticated load, if user has no memberships, call `ensureDefaultWorkspace`.
- No seeding from current hardcoded demo data.

9. WorkOS/Convex environment setup.
- Frontend `.env.local`:
  - `VITE_CONVEX_URL`
  - `VITE_WORKOS_CLIENT_ID`
  - `VITE_WORKOS_REDIRECT_URI` (for example `/callback` path).
- Convex deployment env:
  - `WORKOS_CLIENT_ID`
  - `WORKOS_API_KEY`
  - `WORKOS_WEBHOOK_SECRET`
  - optional `WORKOS_ACTION_SECRET` (phase 2 actions).
- WorkOS dashboard:
  - CORS origins for dev/prod,
  - redirect URI(s),
  - webhook endpoint `https://<deployment>.convex.site/workos/webhook`.

## Phase 2: Chat + File Metadata + Strict Org Enforcement

1. Persist chat (`ChatSidebar`) to Convex.
- Add tables for comment threads/replies/reactions.
- Replace local `PROJECT_COMMENTS` state in `/Users/nick/Designagency/src/app/components/ChatSidebar.tsx` with Convex queries/mutations.
- Preserve current UX features: resolve, edit/delete own comment, reactions, thread collapse.

2. Persist file metadata (not binary storage yet).
- Add `projectFiles` table with `projectId`, `workspaceId`, `tab` (`Assets|Contract|Attachments`), `name`, `type`, `displayDate`, `thumbnailRef`.
- Replace local-only file array updates in `/Users/nick/Designagency/src/app/components/MainContent.tsx`.
- Update `/Users/nick/Designagency/src/app/components/SearchPopup.tsx` to query files from Convex instead of static arrays plus ad hoc attachment merge.

3. Move org-per-workspace from soft mapping to strict enforcement.
- Add organization sync path (WorkOS API/events) to map memberships to `workspaceMembers`.
- Enforce access using `workosOrganizationId` plus synced membership mapping (not just app membership row).
- Add reconciliation job/mutation to repair drift.

## Public APIs / Interfaces / Type Changes

1. Backend public function surface (new generated API).
- `api.dashboard.getSnapshot`
- `api.workspaces.create`
- `api.workspaces.update`
- `api.workspaces.ensureDefaultWorkspace`
- `api.projects.create`
- `api.projects.update`
- `api.projects.setStatus`
- `api.projects.archive`
- `api.projects.unarchive`
- `api.projects.remove`
- `api.projects.updateReviewComments`
- `api.tasks.replaceForProject`
- `api.tasks.bulkReplaceForWorkspace`

2. Frontend type additions/refactors in `/Users/nick/Designagency/src/app/types.ts`.
- Add DB-facing DTOs for workspace/project/task records.
- Add `ProjectStatus` enum type (`Draft|Review|Active|Completed`), with archived handled via `archived` flag.
- Keep existing `ProjectData` UI shape but build it through mapper functions.

3. Auth boundary change.
- Remove local boolean auth control.
- App visibility and data access depend on Convex/WorkOS auth state only.

## Test Cases and Scenarios

1. Auth flow.
- Unauthenticated user sees auth screen.
- Sign in via WorkOS returns to app and loads snapshot.
- Sign out returns to unauthenticated state.
- Unauthorized query/mutation attempts are rejected server-side.

2. Workspace and membership.
- First login creates default workspace when none exists.
- User can create/update workspace.
- User cannot read/mutate non-member workspace by crafted ids.

3. Project lifecycle.
- Create/edit draft/review/active/completed transitions.
- Archive/unarchive/delete.
- Sidebar/task/archive/completed views remain consistent after each mutation.
- Route strings (`project:<publicId>`) remain stable after reload.

4. Task behavior.
- Project page task add/edit/delete/toggle persists.
- Tasks page bulk updates persist and reflect back in project page.
- Cross-view consistency after reload.

5. Regression checks.
- `SearchPopup` project/task navigation works with Convex data.
- `SettingsPopup` workspace rename persists.
- Empty-state behavior works without seeded data.

6. Phase-2-specific checks.
- Chat thread operations persist and reload.
- File metadata add/remove persists and is searchable.
- Strict org enforcement blocks workspace access if org membership missing.

## Assumptions and Defaults Locked

1. No initial migration of existing hardcoded demo data.
2. Existing no-router navigation model remains in place.
3. Phase 1 uses soft org mapping (`workosOrganizationId` optional, app membership enforced).
4. File binary upload/download is not implemented in this migration; metadata only in phase 2.
5. Chat persistence is phase 2, not phase 1.

## References

- [Convex WorkOS AuthKit guide](https://docs.convex.dev/auth/authkit)
- [Convex WorkOS AuthKit component](https://www.convex.dev/components/workos-authkit)
- [WorkOS AuthKit component README](https://raw.githubusercontent.com/get-convex/workos-authkit/main/README.md)
- [Convex React client docs](https://docs.convex.dev/client/react)
- [Convex React Vite AuthKit template (moved)](https://github.com/get-convex/templates/tree/main/template-react-vite-authkit)
