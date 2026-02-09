# Routing Migration (URL-First Navigation)

## Scope
Implemented URL-based routing and public/protected route split for the Build Design dashboard.

## What Changed

### 1. Added browser routing and callback-safe return handling
- Updated `/Users/nick/Designagency/src/main.tsx`:
  - Added `BrowserRouter`.
  - Kept provider order (`AuthKitProvider` -> `ConvexProviderWithAuthKit` -> app).
  - Hardened WorkOS callback return handling:
    - Uses `state.returnTo` only if it is an absolute app path.
    - Defaults to `/tasks`.
    - Compares against full current URL path (`pathname + search + hash`) before deciding redirect vs reload.

### 2. Added routing helpers and route/view adapter
- Added `/Users/nick/Designagency/src/app/lib/routing.ts`:
  - `AppView` union:
    - `tasks`
    - `archive`
    - `project:<id>`
    - `archive-project:<id>`
  - `viewToPath(view)`
  - `pathToView(pathname)`
  - `isProtectedPath(pathname)`

### 3. Replaced auth wrapper model with explicit route tree
- Reworked `/Users/nick/Designagency/src/app/App.tsx`:
  - Replaced `Authenticated/Unauthenticated` split with `react-router-dom` route config.
  - Added protected route guard that redirects unauthenticated access to:
    - `/login?returnTo=<encoded original path>`
  - Added full route contract:
    - Public: `/`, `/login`, `/signup`
    - Protected: `/tasks`, `/archive`, `/archive/:projectId`, `/project/:projectId`, `/settings`
    - Aliases: `/dashboard` and `/inbox` -> `/tasks`
    - Catch-all: `*` -> `/`

### 4. Added marketing landing page on `/`
- Added `/Users/nick/Designagency/src/app/components/MarketingPage.tsx`:
  - Minimal MVP landing with hero/value proposition.
  - CTAs for `/signup` and `/login`.
  - Extra CTA to `/tasks` when user is already authenticated.

### 5. Migrated dashboard navigation to URL source of truth
- In `/Users/nick/Designagency/src/app/App.tsx`:
  - Removed local `currentView` state.
  - Derives `currentView` from route using `pathToView`.
  - Added `navigateView(AppView)` adapter and wired existing components to it.
  - Preserved all existing mutation and popup flows.
  - Added canonicalization and safety handling:
    - Invalid `/project/:id` -> toast + redirect `/tasks`
    - Invalid `/archive/:id` -> toast + redirect `/archive`
    - Archived project hit via `/project/:id` -> rewrite to `/archive/:id`
    - Active project hit via `/archive/:id` -> rewrite to `/project/:id`

### 6. Route-enabled settings popup
- In `/Users/nick/Designagency/src/app/App.tsx`:
  - `/settings` now opens `SettingsPopup`.
  - Opening settings appends `tab` and `from` query params.
  - Closing settings returns to valid `from` protected path or `/tasks` fallback.
  - Direct `/settings` load defaults tab to `Account`.

### 7. Split auth routes by mode
- Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
  - Added props:
    - `mode: "signin" | "signup"`
    - `defaultReturnTo?: string` (defaults to `/tasks`)
  - `/login` and `/signup` now render mode-specific auth behavior.
  - Preserved callback error surfacing (`error`, `error_description`).
  - Preserved redirect-origin mismatch warning.

### 8. Updated navigation callback typing to AppView
- Updated component interfaces to use `AppView` navigation contracts where applicable:
  - `/Users/nick/Designagency/src/app/components/Sidebar.tsx`
  - `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/MainContent.tsx`
  - `/Users/nick/Designagency/src/app/components/ChatSidebar.tsx`

### 9. Dependency update
- Added `react-router-dom` to `/Users/nick/Designagency/package.json` and lockfile.

## Final Route Map
- `/` -> Marketing landing (public)
- `/login` -> WorkOS sign-in (public)
- `/signup` -> WorkOS sign-up (public)
- `/tasks` -> Dashboard tasks (protected)
- `/archive` -> Archive list (protected)
- `/archive/:projectId` -> Archived project detail (protected)
- `/project/:projectId` -> Active/completed project detail (protected)
- `/settings` -> Settings popup route (protected)
- `/dashboard` -> Redirect `/tasks`
- `/inbox` -> Redirect `/tasks`
- `*` -> Redirect `/`

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Follow-ups
- Optional: split dashboard routes into a nested layout route to reduce repeated route declarations.
- Optional: add unit tests for `pathToView` / `viewToPath` and route guard behavior.
