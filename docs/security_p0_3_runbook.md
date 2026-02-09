# P0.3 Security Baseline Runbook

## Scope
This runbook covers the P0.3 baseline hardening steps without secret rotation:
- Env contract validation
- WorkOS URL policy validation
- Tracked-file secret scanning
- Dependency vulnerability gating

## Prerequisites
1. Install dependencies: `npm i`
2. Ensure local frontend env values are configured in `.env.local` (not committed).
3. Ensure Convex deployment env values exist in your deployment settings.

## Security Check Commands
1. Validate matrix + env templates:
   - `npm run security:env`
2. Validate URL policy against matrix:
   - `npm run security:urls`
3. Validate URL policy with placeholder enforcement:
   - `npm run security:urls:strict`
4. Scan tracked files for secrets:
   - `npm run security:secrets`
5. Enforce dependency vulnerability gate (high/critical):
   - `npm run security:deps`
6. Run baseline aggregate checks:
   - `npm run security:check`

## Expected Results
- `security:env` passes when matrix structure and `.env.example` files match.
- `security:urls` passes when URL contracts are valid for all environments.
- `security:urls:strict` fails until placeholder staging/prod domains are replaced.
- `security:secrets` fails on detected secret-like content in tracked files.
- `security:deps` fails only when high/critical vulnerabilities are present.

## If A Check Fails
1. Read the failing line item from script output.
2. Fix the referenced config or file.
3. Re-run the specific script.
4. Re-run `npm run security:check`.

## Staging Sign-off Procedure
1. Replace placeholder staging values in `config/security/environment-matrix.json`.
2. Run all baseline checks.
3. Run strict placeholder enforcement:
   - `npm run security:urls:strict`
4. Record outputs in a dated docs entry and attach command summaries.
