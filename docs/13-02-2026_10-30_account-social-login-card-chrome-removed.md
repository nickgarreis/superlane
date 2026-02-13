# Account social login card chrome removed

## Date
- 13-02-2026 10:30

## Goal
- Remove background, border/stroke, and inner padding from the social login block in account settings.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - removed the outer social auth card surface styling (`bg`, `border`, decorative glow, and `p-4`).
  - removed icon wrapper card styling (`bg`/`border`/rounded panel look).
  - removed auth-method badge pill styling (`bg`/`border`/`px-3`) and kept it as plain inline text.
  - preserved social-auth content and layout structure (provider icon, signed-in text, email, auth method label).

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx` ✅
