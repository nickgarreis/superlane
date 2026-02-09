# Build Design

Production-oriented project workspace for design agency operations.

## Prerequisites

- Node.js 20.x
- npm 10+
- Convex deployment configured
- WorkOS application configured

## Local Setup

1. Install dependencies:
   - `npm i`
2. Configure frontend env:
   - copy `.env.example` values into `.env.local`
3. Configure Convex env:
   - set values from `convex/.env.example` in Convex deployment settings
4. Start frontend:
   - `npm run dev`

## Core Commands

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run lint` - static lint checks
- `npm run typecheck` - Convex codegen + typecheck
- `npm test` - full Vitest suite
- `npm run security:check` - environment, URL, secret, dependency baseline checks
- `npm run perf:check` - performance budget enforcement
- `npm run perf:report` - performance report without failing

## CI Required Gates

GitHub Actions workflow enforces these required jobs:

- lint
- typecheck
- build
- performance
- test
- security
- aggregate required check: `ci-required`

## Operations Docs

- Deployment: `docs/operations/deployment.md`
- Incident response: `docs/operations/incident-response.md`
- Secret rotation: `docs/operations/secret-rotation.md`
- Rollback playbook: `docs/operations/rollback.md`
- Migrations: `docs/operations/migrations.md`
- Permissions model: `docs/operations/permissions-model.md`
- Environment matrix: `docs/operations/environment-matrix.md`

## Security Baseline Docs

- `docs/security_p0_3_runbook.md`
- `docs/security_checklist_template.md`
