# Lint + Typecheck Setup and Validation

## Scope
Implemented requested lint/typecheck execution support and resolved the blocking TypeScript issue introduced during WorkOS org reconciliation wiring.

## Changes Made

### 1. Added runnable lint/typecheck scripts
Updated `/Users/nick/Designagency/package.json` scripts:
- `lint`: `eslint "src/**/*.{ts,tsx}" "convex/**/*.ts" "vite.config.ts"`
- `typecheck`: `convex codegen && tsc --noEmit --project convex/tsconfig.json`

### 2. Added lint tooling dependencies
Updated `/Users/nick/Designagency/package.json` devDependencies:
- `eslint`
- `@typescript-eslint/parser`
- `eslint-plugin-react-hooks`
- `typescript`

### 3. Added ESLint configuration
Created `/Users/nick/Designagency/eslint.config.js`:
- TypeScript parser setup
- `react-hooks` plugin registration
- project ignores for build/generated/imported artifacts

### 4. Fixed Convex circular type inference issue
Refactored reconciliation module split:
- Created `/Users/nick/Designagency/convex/organizationSyncInternal.ts` for internal query/mutation sync operations.
- Kept public action in `/Users/nick/Designagency/convex/organizationSync.ts`.
- Updated action to call internal functions via `makeFunctionReference(...)` to avoid self-referential generated API type inference loops that produced TS7022/TS7023.

### 5. Cleared lint warning
Updated `/Users/nick/Designagency/src/app/components/MentionTextarea.tsx`:
- removed obsolete `eslint-disable-next-line react-hooks/exhaustive-deps` directive that became an unused-warning after lint setup.

## Validation
All requested checks pass now:
- `npm run lint` ✅
- `npm run typecheck` ✅

## Notes
- `npm install` completed successfully and updated lockfile.
- NPM audit currently reports existing low/moderate vulnerabilities (not changed/fixed in this step).
