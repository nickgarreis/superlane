# Completed route + search detail routing

## Date
- 13-02-2026 10:02

## Goal
- Implement canonical Completed routing with list/detail URLs.
- Make search navigation open completed detail directly.
- Preserve background dashboard context through `from` (settings-style behavior) while completed overlay routes are active.

## What changed
- Updated `/Users/nick/Designagency/src/app/lib/routing.ts`:
  - added `AppView` variants: `"completed"` and `` `completed-project:${string}` ``.
  - added route mapping/parsing/protection for `/completed` and `/completed/:id`.

- Updated `/Users/nick/Designagency/src/app/lib/seo.ts` and `/Users/nick/Designagency/src/app/lib/seo.test.ts`:
  - added title handling for completed list/detail routes.

- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.ts`:
  - moved completed popup state to route-derived state (`routeView`) instead of local `useState`.
  - implemented completed route actions with `from` query support:
    - `openCompletedProjectsPopup`
    - `openCompletedProjectDetail(projectId, options?)`
    - `backToCompletedProjectsList`
    - `closeCompletedProjectsPopup`
  - implemented completed `from` validation/fallback rules:
    - reject invalid/unprotected/settings/completed self-references.
    - reject `from=/project/<same-completed-id>` to prevent close-loop redirects.
  - implemented settings-style background preservation for completed routes by deriving `currentView` from validated `from`.

- Updated search routing:
  - `/Users/nick/Designagency/src/app/components/search-popup/useSearchResults.tsx`
  - `/Users/nick/Designagency/src/app/components/search-popup/useSearchDefaultContent.tsx`
  - completed project hits now navigate to `completed-project:<id>` intent.

- Updated search popup binding in `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`:
  - wrapped search `onNavigate` so `completed-project:*` intents call `openCompletedProjectDetail(...)`.

- Updated completed route guard flow:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`
  - completed interception now routes to completed detail (`/completed/:id?from=...`) via navigation API.
  - removed next-active fallback behavior for completed transitions.
  - same-route Active -> Completed now forces `from=/tasks`.
  - added additional origin hardening to avoid completed/self route loops.

- Updated lifecycle route validation:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.ts`
  - added canonical handling for `/completed` and `/completed/:id`.
  - validates/canonicalizes `from` on completed routes.
  - redirects invalid completed detail routes to completed list.

- Updated data hydration priority:
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`
  - `completedProjectDetailId` now takes precedence over route project id for project task/file hydration.

## Tests updated
- `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx`
- `/Users/nick/Designagency/src/app/components/search-popup/useSearchPopupData.test.tsx`
- `/Users/nick/Designagency/src/app/components/SearchPopup.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`
- `/Users/nick/Designagency/src/app/lib/seo.test.ts`

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.test.tsx /Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx /Users/nick/Designagency/src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx /Users/nick/Designagency/src/app/components/search-popup/useSearchPopupData.test.tsx /Users/nick/Designagency/src/app/components/SearchPopup.test.tsx /Users/nick/Designagency/src/app/lib/seo.test.ts` ✅ (60 tests)
- `npm run test:frontend` ⚠️ one unrelated pre-existing failure:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx`
  - assertion expects 45 handler keys, runtime currently returns 47.
- `npx vitest run src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx` ⚠️ reproduces same unrelated failure.
