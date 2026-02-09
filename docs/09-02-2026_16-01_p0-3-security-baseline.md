# P0.3 Security Baseline and Secret Hygiene Implementation

## Summary
Implemented P0.3 baseline hardening (without secret rotation):
- Environment security matrix and env templates
- Frontend and backend fail-fast env validation
- WorkOS URL policy verification scripts
- Tracked-file secret scanning with allowlist support
- Dependency security gating (fail on high/critical)
- Security runbook + checklist documentation

## Changes

### Config and templates
- Added `config/security/environment-matrix.json`
- Added `config/security/secret-scan-allowlist.json`
- Added `.env.example`
- Added `convex/.env.example`

### Runtime validation
- Updated `src/main.tsx`:
  - `VITE_WORKOS_REDIRECT_URI` is now required in all environments
  - Redirect URI must be absolute, use `/auth/callback`, and use HTTPS outside dev
- Added `convex/lib/env.ts`:
  - fail-fast `WORKOS_CLIENT_ID`
  - fail-fast `WORKOS_API_KEY`
  - fail-fast `WORKOS_WEBHOOK_SECRET`
  - fail-fast `WORKOS_ACTION_SECRET`
- Updated `convex/auth.ts` to instantiate AuthKit with validated env values.

### Security scripts
- Added `scripts/security/check-env.mjs`
- Added `scripts/security/check-workos-urls.mjs`
- Added `scripts/security/check-secrets.mjs`
- Added `scripts/security/check-dependencies.mjs`

### Package scripts and dependencies
- Updated `package.json` scripts:
  - `security:env`
  - `security:urls`
  - `security:urls:strict`
  - `security:secrets`
  - `security:deps`
  - `security:check`
- Updated Vite to `6.4.1` (and override to `6.4.1`)
- Updated `package-lock.json`

### Repo hygiene and docs
- Updated `.gitignore` with:
  - `docs/private/**`
  - `security-reports/**`
- Added `docs/security_p0_3_runbook.md`
- Added `docs/security_checklist_template.md`
- Updated `README.md` with a security baseline section.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:rbac` ✅
- `npm run security:env` ✅
- `npm run security:urls` ✅
- `npm run security:secrets` ✅
- `npm run security:deps` ✅
- `npm run security:check` ✅
- `npm run security:urls:strict` ❌ (expected with placeholder staging/prod domains)

## Notes
- Secret rotation remains out of scope in this implementation.
- Action endpoint remains active with existing allow-all action behavior.
- Strict URL placeholder enforcement is intentionally separate for staging/prod sign-off.
