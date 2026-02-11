# Performance Remediation Cutover Complete

**Date:** 10-02-2026 23:48

## Summary
Completed the requested performance remediation cutover for React + Convex with the 5k-task target in mind. This final pass closed remaining integration gaps, added performance guardrails, and validated the full repo test/lint/typecheck pipeline.

## Final Implemented Changes

### Backend: query/mutation and data-shape improvements
- Added and wired additive schema/index updates (already in-progress from previous checkpoint) across:
  - `projects`, `projectComments`, `commentReactions`, `tasks`, `projectFiles`
- Refactored dashboard query surface:
  - `convex/dashboard.ts` now centered on scoped context/summary/snapshot queries
  - shared context/snapshot utilities extracted to `convex/lib/dashboardContext.ts`
- Refactored task domain:
  - `convex/tasks.ts` reduced to focused query/mutation exports
  - shared task normalization/access/legacy replacement logic extracted to `convex/lib/taskMutations.ts`
  - granular mutations (`create`, `update`, `remove`, `reorder`) are the active frontend path
  - legacy replace mutations retained for compatibility window
- Query path optimizations retained:
  - comments reaction fetch by `projectPublicId` index with legacy fallback
  - files workspace listing uses indexed + paginated retrieval
  - hot-path avatar URL resolution prefers persisted URL before storage URL lookup
- Added one-time backfill handler for denormalized fields:
  - `convex/performanceBackfills.ts` → `backfillWorkspaceDenormalizedFields`
  - backfills project creator snapshot fields, comment author snapshot fields, and reaction `projectPublicId`/`workspaceId` keys.

### Frontend: data contract cutover + large-list rendering
- `useDashboardData` now consumes scoped/paginated domain queries instead of monolithic snapshot payload dependency.
- Task update wiring moved to delta-based sync against granular mutations.
- Introduced reusable task sync helper:
  - `src/app/dashboard/hooks/useDashboardTaskSync.ts`
- Refactored project action hook to reduce complexity and pass file-size quality gates.
- Added virtualization with `@tanstack/react-virtual` for large lists:
  - Task rows
  - File rows
  - Search results
  - Chat unresolved comment threads
- Added helper extraction to keep component/hook files maintainable:
  - `src/app/components/project-tasks/taskRowHelpers.ts`

### Performance guardrails
- Extended bundle budget checks to include route chunks:
  - `SearchPopup`
  - `ChatSidebar`
  - `CreateProjectPopup`
- Updated:
  - `config/performance/bundle-budgets.json`
  - `scripts/quality/check-bundle-budgets.mjs`

### Backend scale/performance coverage
- Added seeded scaling test:
  - `convex/__tests__/performance_scaling.test.ts`
- Covers a large fixture (`50 projects`, `5k tasks`, `2k files`, `1k comments`) and validates:
  - scoped dashboard context payload contract
  - paginated project/task/file query behavior at target scale
  - comment list behavior with reactions at scale

### Test updates for new contracts
- Updated affected tests for new data/mutation contracts:
  - `src/app/dashboard/useDashboardData.test.tsx`
  - `src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx`
  - `src/app/dashboard/hooks/useDashboardProjectActions.test.tsx`
  - `convex/__tests__/collaboration_identity.test.ts`

## Validation Run
All checks pass after cutover:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run perf:check`
- `npm run build`

## Notes
- Legacy full-replace task mutations remain intentionally available for short stabilization compatibility.
- Frontend and backend now execute on the new granular + paginated paths for normal flows.
