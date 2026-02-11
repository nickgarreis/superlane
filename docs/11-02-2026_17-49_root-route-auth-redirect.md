# Root Route Auth Redirect

**Date:** 11-02-2026 17:49

## What changed
- Replaced the `/` route behavior in `src/app/components/RootPage.tsx` from marketing-page rendering to auth-aware redirect routing.
- New `/` behavior:
  - Authenticated users are redirected to `/tasks`.
  - Unauthenticated users are redirected to `/login?returnTo=/tasks`.
  - If `code` query params are present on `/`, the route forwards to `/auth/callback` preserving query params.
  - If WorkOS error params are present on `/`, the route redirects to the attempted auth mode (`/signup` or `/login`) while preserving `returnTo` and error params.
- Added route-level tests in `src/app/components/auth_routing.test.tsx` to validate:
  - unauthenticated `/` redirect to login,
  - authenticated `/` redirect to tasks,
  - callback code forwarding from `/` to `/auth/callback`,
  - WorkOS error redirect mode handling from `/`.

## Validation
- Ran `npm run test:frontend -- src/app/components/auth_routing.test.tsx`.
- Result: pass (`53` files, `162` tests passed).
