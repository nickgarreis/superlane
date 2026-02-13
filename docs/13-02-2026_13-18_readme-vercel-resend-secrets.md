# README update: Vercel + Resend usage and secrets

## Date
- 13-02-2026 13:18

## Goal
- Add missing documentation about Vercel usage and Resend-related secrets in the root `README.md`.

## What changed
- Updated `/Users/nick/Designagency/README.md`:
  - Added explicit mention of Vercel in stack/deploy context.
  - Added explicit mention of Resend integration context.
  - Expanded frontend env section to include `VITE_CONVEX_SITE_URL` and optional `VITE_NOTIFICATIONS_FROM_EMAIL`.
  - Added a Resend-related backend secrets list:
    - `RESEND_API_KEY`
    - `RESEND_WEBHOOK_SECRET`
    - `NOTIFICATIONS_FROM_EMAIL`
  - Added dedicated `Vercel and Resend` section describing:
    - Vercel deploy path (`npx vercel --prod`)
    - current notification email transport status
    - secret placement split between Vercel (frontend vars) and Convex (backend secrets)

## Validation
- Documentation-only change; no code execution required.
