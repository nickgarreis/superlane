# Routing Problem Assessment

## Problem
Different URLs such as:
- `http://localhost:5173/`
- `http://localhost:5173/dashboard`
- `http://localhost:5173/inbox`

render the same screen in the app.

## Root Cause
The project currently has no URL router.

### Current architecture
- Navigation is managed by local React state (`currentView`) in:
  - `/Users/nick/Designagency/src/app/App.tsx`
- View switching is done through strings like:
  - `tasks`
  - `archive`
  - `project:<id>`
- Browser pathname is not used for view resolution.

## Why all paths look the same
- Vite serves the same SPA entry HTML for all local paths.
- Since the app does not parse `window.location.pathname`, it starts with the same in-app default view regardless of URL.

## Impact
- No deep-linking by URL
- Browser back/forward cannot represent meaningful app navigation
- Shared links cannot open exact app views reliably
- Auth return paths are harder to reason about/debug

## Recommended fix
Implement URL-based routing (e.g. `react-router-dom`) and map existing `currentView` states to real routes.

### Suggested route mapping
- `/tasks`
- `/archive`
- `/project/:projectId`
- `/settings`
- `/` for auth/entry

## Migration note
Keep existing internal view logic during transition, but make URL the source of truth to avoid regressions.
