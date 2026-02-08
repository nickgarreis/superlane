# CLAUDE.md

This file provides guidance when working with code in this repository.

## Project Overview

"Build Design" — a design agency project management dashboard built with React + TypeScript. Originally generated from a Figma design via **Figma Make**, so many files (especially in `src/imports/`) are auto-generated and should not be manually edited.

## Commands

- `npm i` — install dependencies
- `npm run dev` — start Vite dev server
- `npm run build` — production build

No test runner or linter is configured.

## Architecture

**Stack:** React 18, Vite, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), shadcn/ui components (Radix primitives), Motion (framer-motion), react-dnd, Sonner toasts.

**Entry point:** `src/main.tsx` → `src/app/App.tsx`

**All state lives in `App.tsx`** — projects, workspaces, authentication, navigation, popups. There is no router; navigation is string-based (`currentView` state like `"project:website-redesign"`, `"tasks"`, `"archive"`). Project data is hardcoded in `INITIAL_PROJECTS` at the top of `App.tsx`.

**Key directories:**
- `src/app/components/` — page-level components (Sidebar, MainContent, Tasks, ArchivePage, popups)
- `src/app/components/ui/` — shadcn/ui primitives (button, dialog, tabs, etc.)
- `src/imports/` — **Figma Make auto-generated** SVG components and layout fragments. Do not manually edit these.
- `src/assets/` — image assets referenced via `figma:asset/` import paths (Vite resolves these)
- `src/styles/` — CSS: `index.css` imports `fonts.css` (Google Fonts Roboto), `tailwind.css`, and `theme.css` (CSS custom properties for light/dark themes)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

**Types** are in `src/app/types.ts`: `Workspace`, `ProjectData`, `ProjectDraftData`, `Task`.

**Path alias:** `@` maps to `./src` (configured in `vite.config.ts`).

## Figma Make Conventions

- Image assets use `figma:asset/<hash>.png` import syntax — Vite resolves these to files in `src/assets/`.
- SVG icons are exported as path-data modules in `src/imports/svg-*.ts` files.
- Layout components in `src/imports/` (e.g., `Container.tsx`, `Frame.tsx`, `HorizontalBorder.tsx`) are generated scaffolding.

## Styling

- Dark theme by default (background `#141515`, text `#E8E8E8`, font Roboto)
- Tailwind v4 with `source(none)` + explicit `@source` directive in `tailwind.css`
- Theme tokens defined as CSS custom properties in `theme.css` with light/dark variants
- Custom animations in `theme.css`: `taskRowFlash`, `fileRowFlash`, `archiveRowFlash`, `mentionBadgePulse`
- Sonner toast styling is customized via CSS selectors in `theme.css`

## Code of Work
- **Start** every run with reading the latest files in the docs/ folder to understand what the last changes to our codebase made were.
- **Continue** by thoroughly analysing the codebase to not miss an important part in your thinkings
- **Always** create a new file inside docs/ using the format dd-mm-yyyy_hh-mm_name.md after making changes to the codebase describing what you did.
