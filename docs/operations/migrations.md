# Migration Runbook

## Scope

Run and verify backend/data migrations safely.

## Current Migration Actions

### Date Normalization Migration

The repository includes date normalization actions in `convex/dateNormalization.ts`.

Recommended flow:

1. Preview impact:
   - call `dateNormalization.preview`
2. Review planned patches/failures.
3. Apply normalization:
   - call `dateNormalization.apply`
4. Re-run preview to ensure no remaining patchable rows.

## Migration Safety Procedure

1. Deploy migration code to staging first.
2. Run preview and archive output.
3. Apply in staging, run smoke tests.
4. Repeat in production with maintenance window if required.

## Validation Commands

- `npm run typecheck`
- `npm test`
- `npm run build`

Expected result:
- No schema/type/test regression.

If migration fails:
- Stop further applies.
- Capture failing row IDs and reason.
- Apply targeted fix or rollback based on incident severity.

## Template for Future Migrations

For every new migration, document:
- Migration name and owner
- Preconditions
- Preview command/query
- Apply command/query
- Backout plan
- Validation checklist
- Links to deployment/incident logs
