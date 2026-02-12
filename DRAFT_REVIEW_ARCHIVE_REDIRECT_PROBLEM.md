# Draft/Review Redirect Problem Analysis (Archive + Search Path)

## Problem statement
When a user is on `/archive`, opens the Search popup, and selects a project in `Draft` or `Review` status, the UI should:
1. Open the corresponding popup-only flow (`Create/Edit Draft` or `In Review`).
2. Keep the user on the origin page (`/archive`).

Observed behavior has been inconsistent, with users still ending up on `/tasks`.

## Why this is tricky
The app currently uses multiple layers that react to route changes:
- Search result action triggers `onNavigate("project:<id>")`.
- Draft/Review route guard intercepts `/project/<id>` and redirects away from embedded view.
- Dashboard lifecycle effects also validate project routes and can redirect invalid/missing routes.
- Data source for projects changes depending on view state (`archive/search` vs normal active-project state).

Because these layers run in close sequence, the selected project can be present at one moment and missing in a later project map snapshot.

## Detailed technical flow (failing case)
1. User is on `/archive`.
2. Search popup opens and lists projects from the broader project map used in archive/search context.
3. User selects a Draft/Review project; Search calls navigation to `/project/<id>`.
4. During this transition, project datasets can swap to a narrower active-project map.
5. If the selected Draft/Review project is temporarily not present in that current map, the Draft/Review guard cannot classify the route as popup-only.
6. Lifecycle route validation treats it as missing/invalid and falls back to `/tasks`.

Net result: user sees popup flow but lands on `/tasks` instead of returning to `/archive`.

## Expected deterministic behavior
For any Draft/Review route reached from Search while the user came from `/archive`:
- The app must always open popup-only flow.
- The app must always return to `/archive` (replace navigation).
- Data map swaps must not change this outcome.

## What has already been changed
- Embedded Draft/Review project detail rendering was disabled.
- Route guard was introduced to open popup flow and redirect away from `/project/*`.
- Redirect target was changed from hardcoded `/tasks` to last non-project path.
- Guard now tracks non-project origin path synchronously.
- Guard now caches last-seen projects, so even if the current map drops the project during transition, popup classification still succeeds.

## Current likely root cause of past failures
Past failures were caused by a race between:
- route transition (`/archive` -> `/project/<id>`),
- project-map source swap,
- and lifecycle fallback logic.

When the guard looked only at the current project map, it could miss the selected Draft/Review project and fail to perform origin-preserving redirect.

## Verification scenarios that matter
The issue is only truly fixed if all are true:
1. `/archive` -> Search -> Draft result => popup opens + URL returns to `/archive`.
2. `/archive` -> Search -> Review result => popup opens + URL returns to `/archive`.
3. Same as above when selected project is absent from the immediate active-project map but was available in prior archive/search map.
4. Direct deep-link `/project/<draft-or-review-id>` (no archive origin) uses safe fallback (`/tasks`) after opening popup flow.

## Notes
This issue is not about allowing embedded Draft/Review pages; those are intentionally disabled.
It is specifically about preserving origin context during popup-only interception in route transitions triggered from Search.
