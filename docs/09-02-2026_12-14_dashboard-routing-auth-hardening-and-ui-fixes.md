# Dashboard Routing, Auth ReturnTo Hardening, and UI Fixes

## Summary
Implemented a set of routing, redirect-safety, and prop/type-safety fixes across the app to prevent remount churn, block open-redirect vectors, and remove runtime/typing hazards.

## Changes

### 1) Dashboard route remount fix
Updated `/Users/nick/Designagency/src/app/App.tsx`:
- Replaced multiple dashboard-specific protected routes with one wildcard protected route:
  - `path="/*"` rendering `<ProtectedRoute><DashboardApp /></ProtectedRoute>`
- Removed duplicate route blocks for:
  - `/tasks`
  - `/archive`
  - `/archive/:projectId`
  - `/project/:projectId`
  - `/settings`

### 2) Auth callback returnTo sanitization
Updated `/Users/nick/Designagency/src/app/components/AuthCallbackPage.tsx`:
- Added `sanitizeReturnTo()` helper with control-character validation.
- Allowed only:
  - internal absolute paths (`/path`, but not `//...`)
  - same-origin absolute URLs (normalized to `pathname + search + hash`)
- Falls back to `/tasks` for invalid values.
- Replaced direct use of `readStoredReturnTo()` with sanitized value.

### 3) Auth page returnTo validation hardening
Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
- Hardened `ensureSafeReturnTo()`:
  - trims input
  - rejects control chars
  - requires single-leading-slash path
  - rejects `//...` and values containing `://`
  - falls back to provided fallback for unsafe input

### 4) CommentItem avatar prop fix
Updated `/Users/nick/Designagency/src/app/components/ChatSidebar.tsx`:
- Added `currentUserAvatar?: string` to `CommentItemProps`.
- Updated `CommentItem` signature to receive it.
- Added `currentUserAvatar` to recursive `sharedProps` and top-level `sharedCommentProps`.
- Updated reply avatar render to use `currentUserAvatar || imgNickGarreis`.
- Resolves `currentUserAvatar` reference error in `CommentItem`.

### 5) Pending file tab type guard
Updated `/Users/nick/Designagency/src/app/components/MainContent.tsx`:
- Added `PROJECT_FILE_TABS` constant and `isProjectFileTab()` type guard.
- Removed unsafe cast when consuming `pendingHighlight.fileTab`.
- Now only calls `setActiveTab(...)` when tab is validated.
- Kept existing file lookup logic unchanged.

### 6) Marketing auth CTA visibility
Updated `/Users/nick/Designagency/src/app/components/MarketingPage.tsx`:
- Wrapped `Create account` and `Sign in` links in `!isAuthenticated` conditional.
- Preserved existing `isAuthenticated` conditional for `Open dashboard`.

### 7) SearchPopup file dedupe key hardening
Updated `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`:
- Reworked dedupe key to avoid null-project collisions using:
  - normalized project ID sentinel (`"no-project"`)
  - plus file ID in key
- Updated pushed entry project ID normalization to `file.projectPublicId ?? null`.

### 8) Stored returnTo path sanitizer hardening
Updated `/Users/nick/Designagency/src/app/lib/authReturnTo.ts`:
- Hardened `sanitizePath()`:
  - trims input
  - rejects empty/control-character values
  - requires leading `/`
  - rejects `//...`
  - rejects values containing `://`

### 9) Safe decoding in router path parsing
Updated `/Users/nick/Designagency/src/app/lib/routing.ts`:
- Added `safeDecodePathSegment()` wrapper around `decodeURIComponent`.
- Updated archive/project path parsing to avoid throwing `URIError` on malformed encodings.
- Falls back to no match when decoding fails.

### 10) WorkOS redirect callback returnTo hardening
Updated `/Users/nick/Designagency/src/main.tsx`:
- Added `sanitizeReturnToPath()` helper used in `onRedirectCallback`.
- Rejects control chars, `//...`, and `://` values.
- Ensures only safe internal paths are accepted from `state.returnTo` before redirect.
- Kept existing redirect flow and storage clearing behavior intact.

## Validation
- `npm run build` ✅
