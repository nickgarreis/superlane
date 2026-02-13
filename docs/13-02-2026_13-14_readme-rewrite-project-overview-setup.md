# README rewrite: project overview and setup

## Date
- 13-02-2026 13:14

## Goal
- Replace the root `README.md` with a detailed, easy-to-read guide that explains what the project does and how to set it up locally.

## What changed
- Rewrote `/Users/nick/Designagency/README.md` with:
  - A clear project purpose section for design agency operations.
  - A concise capabilities summary (projects, tasks, comments, files, permissions).
  - A full setup path:
    - prerequisites
    - dependency installation
    - frontend/backend environment variable setup from examples
    - local run flow with `npm run convex:dev` + `npm run dev`
  - Auth and callback setup notes for WorkOS.
  - Updated project structure and route overview.
  - Script reference grouped by development, build/typecheck, tests, quality/security, and seed commands.
  - Backend architecture summary and CI/operations doc links.
  - Troubleshooting section for common local setup/auth/deployment mismatch issues.
  - Security reminder not to commit secrets.

## Validation
- Documentation-only change; no code execution required.
