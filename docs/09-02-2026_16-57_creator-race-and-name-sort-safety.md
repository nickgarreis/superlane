# Null-Safe Member Sorting + Creator Fetch Dedup

## Summary
Addressed two backend correctness issues:
- Made workspace member sorting resilient to nullable/undefined names.
- Removed concurrent creator lookup race in dashboard snapshot creator enrichment.

## Changes

### `convex/collaboration.ts`
- Updated `resolvedMembers.sort(...)` comparator to keep existing viewer-priority checks unchanged.
- Added defensive name normalization before lexical comparison:
  - `const aName = a.name ?? ""`
  - `const bName = b.name ?? ""`
- Uses `aName.localeCompare(bName)` to avoid runtime throw when names are missing.

### `convex/dashboard.ts`
- Replaced per-project concurrent creator resolution with a unique-ID pass:
  - Built `uniqueCreatorUserIds` from `activeProjects` using `Set`.
  - Ran `Promise.all` over unique creator IDs.
  - Per unique creator ID, fetched creator once via `ctx.db.get(...)`, resolved avatar once via `resolveAvatarUrl(...)`, and populated `creatorById`.
- Preserves the existing unknown-user fallback shape.

## Validation
- `npm run build` ✅
