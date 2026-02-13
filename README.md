# Build Design

[https://github.com/nickgarreis/superlane/intro_2.mp4](https://github.com/user-attachments/assets/48dc5cc8-e78c-4408-a43e-c148c2d781a2)

Build Design is a real-time project operations dashboard for design agencies.
It combines planning, collaboration, task management, file handling, and workspace governance in one app.

This repository contains:
- A React + TypeScript frontend (Vite)
- A Convex backend (queries, mutations, actions, cron jobs, schema)
- WorkOS AuthKit authentication and organization-aware access control

## What this project is for

Use Build Design to run day-to-day agency work with a single shared source of truth:
- Track projects through lifecycle states (Draft, Review, Active, Completed, Archive)
- Manage project-scoped and workspace-level tasks
- Store and review project files and attachments
- Run threaded collaboration comments with reactions and status
- Enforce role-based workspace permissions (owner/admin/member)
- Keep audit-friendly, actor-attributed changes across core workflows

## Tech stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Motion, react-dnd
- Backend: Convex (database + server functions + storage + scheduled jobs)
- Auth: WorkOS AuthKit (`@workos-inc/authkit-react`, `@convex-dev/workos-authkit`)
- Hosting/Deploy: Vercel (frontend) + Convex deploys (backend)
- Email provider integration: Resend package is installed for notification workflows
- Testing: Vitest, Testing Library, `convex-test`
- Quality/Security: ESLint, custom quality gates, security and performance scripts

## Quick start

### 1) Prerequisites

- Node.js 20+
- npm 10+
- A Convex account/project
- A WorkOS application configured for your environment

### 2) Install dependencies

```bash
npm i
```

### 3) Configure environment variables

Create `/.env.local` from `/.env.example`:

```bash
cp .env.example .env.local
```

Required frontend variables:
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_WORKOS_CLIENT_ID`
- `VITE_WORKOS_REDIRECT_URI` (must end with `/auth/callback`)

Optional frontend variable:
- `VITE_WORKOS_API_HOSTNAME`
- `VITE_NOTIFICATIONS_FROM_EMAIL` (used for contact mailto link in the UI)

Create `/convex/.env` from `/convex/.env.example`:

```bash
cp convex/.env.example convex/.env
```

Required backend variables:
- `WORKOS_CLIENT_ID`
- `WORKOS_API_KEY`
- `WORKOS_WEBHOOK_SECRET`
- `WORKOS_ACTION_SECRET`
- `SITE_URL`

Optional backend variable:
- `DEV_SEED_ENABLED`

Resend-related backend secrets (recommended to provision in managed environments):
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `NOTIFICATIONS_FROM_EMAIL`

### 4) Run the app locally

Start backend and frontend in separate terminals.

Terminal A:

```bash
npm run convex:dev
```

Terminal B:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Setup notes for WorkOS and auth callback

- The frontend enforces required env vars at boot. Missing values throw clear startup errors.
- `VITE_WORKOS_REDIRECT_URI` must be a valid absolute URL and must use `/auth/callback`.
- In production/non-dev environments, redirect URI must be `https`.
- Login and signup flows route through WorkOS hosted auth and return via `/auth/callback`.

## Vercel and Resend

### Vercel usage

- Frontend hosting target is Vercel.
- Standard production deploy flow is:
  - `npm run build`
  - `npx vercel --prod`
- Rollback and operational guidance is documented in `/docs/operations/deployment.md` and `/docs/operations/rollback.md`.

### Resend usage

- The project includes Resend dependencies (`@convex-dev/resend`) for notification-email workflows.
- Current notification dispatch path in `/convex/notificationsEmail.ts` intentionally skips external email transport, so no live emails are sent from that path right now.
- Provisioning Resend secrets is still recommended for production readiness and future re-enablement.

### Secret placement (important)

- Frontend secrets/vars belong in Vercel project environment settings:
  - `VITE_CONVEX_URL`
  - `VITE_CONVEX_SITE_URL`
  - `VITE_WORKOS_CLIENT_ID`
  - `VITE_WORKOS_REDIRECT_URI`
  - optional: `VITE_WORKOS_API_HOSTNAME`, `VITE_NOTIFICATIONS_FROM_EMAIL`
- Backend secrets belong in Convex deployment environment variables:
  - `WORKOS_CLIENT_ID`
  - `WORKOS_API_KEY`
  - `WORKOS_WEBHOOK_SECRET`
  - `WORKOS_ACTION_SECRET`
  - `SITE_URL`
  - `RESEND_API_KEY`
  - `RESEND_WEBHOOK_SECRET`
  - `NOTIFICATIONS_FROM_EMAIL`

## Project structure

```text
.
├── convex/                 # Backend schema, functions, auth, crons, tests
├── docs/                   # Project and operations documentation
├── public/                 # Static assets
├── scripts/                # Security/quality/performance scripts
├── src/
│   ├── app/                # Application logic and UI composition
│   ├── assets/             # Resolved figure/image assets
│   ├── imports/            # Figma Make generated code (do not edit manually)
│   └── styles/             # Global CSS, theme tokens, fonts
├── vite.config.ts
└── vitest.config.ts
```

Important convention:
- Files in `/src/imports/` are generated from Figma Make scaffolding. Avoid manual edits there.

## Routing overview

Public routes:
- `/`
- `/login`
- `/signup`
- `/auth/callback`
- `/reset-password`

Convenience aliases:
- `/dashboard` -> `/tasks`
- `/inbox` -> `/tasks`

Protected app views are handled inside the dashboard shell and include:
- `/tasks`
- `/archive`
- `/completed`
- `/drafts`
- `/pending`
- `/project/:projectId`
- `/archive/:projectId`
- `/completed/:projectId`
- `/drafts/:projectId`
- `/pending/:projectId`
- `/settings`

## Core commands

### Development

- `npm run dev` - start Vite dev server
- `npm run convex:dev` - start Convex development server (watch/deploy functions)
- `npm run convex:deploy` - deploy Convex functions to production

### Build and type safety

- `npm run build` - production frontend build
- `npm run typecheck` - frontend and backend type checks (includes Convex codegen)
- `npm run typecheck:frontend` - frontend-only type checks
- `npm run typecheck:backend` - backend-only type checks

### Tests

- `npm test` - full test suite
- `npm run test:frontend` - frontend tests (`src/app`)
- `npm run test:backend` - backend tests (`convex/__tests__`)
- `npm run test:frontend:coverage` - frontend coverage run
- `npm run test:backend:coverage` - backend coverage run

### Quality, performance, and security

- `npm run lint` - ESLint + repository quality checks
- `npm run lint:checks` - custom quality gates only
- `npm run perf:check` - enforce performance and bundle budgets
- `npm run perf:report` - performance report (non-blocking mode)
- `npm run security:check` - env, URL, secret, and dependency checks

### Seed data (optional)

- `npm run seed:apply` - apply development seed data
- `npm run seed:reset` - reset development seed data
- `npm run seed:reseed` - reset and apply seed data

## Backend architecture summary

Key backend modules in `/convex`:
- `schema.ts` - database schema and indexes
- `dashboard.ts`, `projects.ts`, `tasks.ts`, `files.ts`, `comments.ts`, `settings.ts`, `workspaces.ts` - domain functions
- `auth.ts` and `lib/auth.ts` - auth and identity boundaries
- `crons.ts` - scheduled cleanup/backfill tasks
- `http.ts` - HTTP router / webhook endpoints

Common patterns:
- Role-based authorization enforced server-side
- Soft-delete and retention behavior for files/projects
- Convex storage-backed uploads
- Real-time query reactivity for live UI updates

## CI and operational docs

CI workflow (GitHub Actions) enforces required checks for:
- Lint
- Typecheck
- Build
- Performance
- Test
- Security

Operational references:
- `/docs/operations/deployment.md`
- `/docs/operations/incident-response.md`
- `/docs/operations/secret-rotation.md`
- `/docs/operations/rollback.md`
- `/docs/operations/migrations.md`
- `/docs/operations/permissions-model.md`
- `/docs/operations/environment-matrix.md`

## Troubleshooting

### App fails at startup with missing env var error

Confirm `/.env.local` contains required `VITE_*` variables and restart dev server.

### Auth redirects but does not complete

Verify:
- WorkOS app callback URL exactly matches `VITE_WORKOS_REDIRECT_URI`
- Redirect URI path is `/auth/callback`
- Production callback URL uses `https`

### Frontend runs but data is missing

Verify `npm run convex:dev` is running and `VITE_CONVEX_URL` targets the same Convex deployment.

### Convex functions or types look stale

Run:

```bash
npm run typecheck
```

This regenerates Convex codegen and validates backend types.

## Security note

Do not commit real secrets to source control. Use local env files and deployment secret managers for production credentials.
