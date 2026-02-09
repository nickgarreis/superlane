# AGENTS.md

This file provides guidance when working with code in this repository.

## Project Overview

"Build Design" — a design agency project management dashboard built with React + TypeScript + Convex. The frontend was originally generated from a Figma design via **Figma Make**, so files in `src/imports/` are auto-generated and should not be manually edited.

## Commands

- `npm i` — install dependencies
- `npm run dev` — start Vite dev server (frontend only; run `npm run convex:dev` alongside for backend)
- `npm run build` — production build
- `npm run convex:dev` — start Convex dev server (watches and deploys functions)
- `npm run convex:deploy` — deploy Convex functions to production
- `npm run lint` — ESLint across `src/` and `convex/`
- `npm run typecheck` — runs `convex codegen` then `tsc --noEmit` against `convex/tsconfig.json`
- `npm test` — run all tests (Vitest)
- `npm run test:backend` — backend tests only (`convex/__tests__/`)
- `npm run test:frontend` — frontend tests only (`src/app/`)
- `npm run security:check` — run all security scripts (env, URLs, secrets, deps)

## Architecture

**Stack:** React 18, Vite, Convex (real-time backend), WorkOS AuthKit (auth), Tailwind CSS v4, shadcn/ui (Radix primitives), Motion (framer-motion), react-dnd, Sonner toasts.

### Frontend

**Entry point:** `src/main.tsx` → `src/app/App.tsx`

**Provider order** in `main.tsx`: `AuthKitProvider` → `ConvexProviderWithAuthKit` → `BrowserRouter` → `App`

**Routing:** react-router-dom v7. Routes defined in `App.tsx` with helpers in `src/app/lib/routing.ts`.
- Public: `/`, `/login`, `/signup`, `/auth/callback`
- Protected (wrapped in `ProtectedRoute`): `/tasks`, `/archive`, `/archive/:projectId`, `/project/:projectId`, `/settings`
- Aliases: `/dashboard` → `/tasks`, `/inbox` → `/tasks`
- `AppView` type (`"tasks" | "archive" | "project:{id}" | "archive-project:{id}"`) bridges internal view state and URL paths via `viewToPath()` / `pathToView()`

**App.tsx is the state hub** (~1300 lines) — all Convex queries/mutations, UI state (sidebar, popups, highlights, editing), and navigation logic live here. No global state library.

**Key directories:**
- `src/app/components/` — pages (Tasks, ArchivePage, MainContent, AuthPage, RootPage), layout (Sidebar, ChatSidebar), popups (CreateProjectPopup, SettingsPopup, SearchPopup, etc.)
- `src/app/components/ui/` — shadcn/ui primitives
- `src/app/lib/` — routing helpers, date utilities
- `src/imports/` — **Figma Make auto-generated**. Do not manually edit.
- `src/assets/` — images resolved via `figma:asset/` import paths (custom Vite plugin)
- `src/styles/` — `index.css` imports `fonts.css`, `tailwind.css`, and `theme.css`
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

**Types** in `src/app/types.ts`: `Workspace`, `ProjectData`, `ProjectDraftData`, `Task`.

**Path alias:** `@` maps to `./src`.

### Backend (Convex)

All backend logic lives in `convex/`. Schema in `convex/schema.ts` defines 13 tables: `users`, `workspaces`, `workspaceMembers`, `projects`, `tasks`, `projectFiles`, `pendingFileUploads`, `projectComments`, `commentReactions`, `notificationPreferences`, `workspaceBrandAssets`, `workspaceInvitations`, `workosOrganizationMemberships`.

**Function files:** `dashboard.ts` (main snapshot query), `workspaces.ts`, `projects.ts`, `tasks.ts`, `files.ts`, `comments.ts`, `collaboration.ts`, `settings.ts`.

**Helper libs** (`convex/lib/`):
- `auth.ts` — `requireAuthUser()`, `requireWorkspaceRole()`, `requireProjectRole()` — auth boundary helpers
- `rbac.ts` — role matrix and permission checks (owner/admin/member)
- `filePolicy.ts` — file validation (100MB max, 25 files/project, MIME allowlist)
- `validators.ts`, `dateNormalization.ts`, `env.ts`, `projectAttachments.ts`, `workosOrganization.ts`

**Key patterns:**
- **RBAC enforced at every mutation boundary** — no client-side permission logic
- **Logical (soft) deletion** with 30-day retention + daily cron purge (`convex/crons.ts`)
- **Real file storage** via Convex storage — SHA-256 checksums computed client-side, signed upload URLs
- **Pending upload pattern** — draft attachments tracked in `pendingFileUploads`, consumed on project create/update, discarded on cancel
- **Actor traceability** — `createdByUserId`, `updatedByUserId`, `deletedByUserId` fields
- **Real-time reactivity** — Convex subscriptions power live updates across all clients

### Auth (WorkOS AuthKit)

- **Frontend:** `@workos-inc/authkit-react` — `useAuth()` provides user, access token, sign out
- **Backend:** `@convex-dev/workos-authkit` — registered as Convex component in `convex/convex.config.ts`
- **Auth flow:** `/login` or `/signup` → WorkOS hosted form → `/auth/callback` → sanitized redirect
- **Identity resolution:** `requireAuthUser()` in `convex/lib/auth.ts` gets WorkOS identity and auto-provisions into `users` table
- **Organization gating:** workspace access requires active WorkOS org membership (checked via `workosOrganizationMemberships` table)
- **Webhook events:** org/membership lifecycle synced via `convex/http.ts`

### File Upload Flow

1. Compute SHA-256 checksum client-side
2. Call `generateUploadUrl` mutation
3. POST bytes to signed URL
4. Call `finalizeProjectUpload` or `finalizePendingDraftAttachmentUpload` action
5. Pending uploads tracked for draft sessions, consumed on project create/update

## Testing

**Framework:** Vitest + `convex-test` (backend), `@testing-library/react` (frontend).

**Backend tests** (`convex/__tests__/`): RBAC enforcement, file storage lifecycle, collaboration identity, comments/reactions, date normalization, settings mutations.

**Frontend tests** (`src/app/`): protected route guards, return-to sanitization, callback handling, date utilities.

**Config:** `vitest.config.ts` — node environment, setup file at `src/app/test/setup.ts`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pull requests — parallel jobs: lint, typecheck, build, test, security check. All must pass via `ci-required` aggregate gate.

## Figma Make Conventions

- Image assets use `figma:asset/<hash>.png` import syntax — custom Vite plugin resolves to `src/assets/`.
- SVG icons are path-data modules in `src/imports/svg-*.ts` files.
- Layout components in `src/imports/` are generated scaffolding.

## Styling

- Dark theme by default (background `#141515`, text `#E8E8E8`, font Roboto)
- Tailwind v4 with `source(none)` + explicit `@source` directive in `tailwind.css`
- Theme tokens defined as CSS custom properties in `theme.css` with light/dark variants
- Custom animations in `theme.css`: `taskRowFlash`, `fileRowFlash`, `archiveRowFlash`, `mentionBadgePulse`
- Sonner toast styling customized via CSS selectors in `theme.css`

## Environment Variables

**Frontend** (`.env`): `VITE_CONVEX_URL`, `VITE_WORKOS_CLIENT_ID`, `VITE_WORKOS_REDIRECT_URI`, `VITE_WORKOS_API_HOSTNAME` (optional).

**Backend** (`convex/.env`): `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_WEBHOOK_SECRET`, `WORKOS_ACTION_SECRET`.

## Code of Work

- **Start** every run with reading the latest files in the `docs/` folder to understand what the last changes to the codebase made.
- **Continue** by thoroughly analysing the codebase to not miss an important part in your thinkings.
- **Always** create a new file inside `docs/` using the format `dd-mm-yyyy_hh-mm_name.md` after making changes to the codebase describing what you did.
