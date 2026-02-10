# Environment Matrix

## Source

Derived from:
- `config/security/environment-matrix.json`

Validation command:
- `npm run security:env`

## Dev

- App origin: `http://localhost:5173`
- Redirect URI: `http://localhost:5173/auth/callback`
- Convex site URL: `https://reminiscent-basilisk-934.convex.site`
- WorkOS webhook URL: `https://reminiscent-basilisk-934.convex.site/workos/webhook`
- WorkOS action URL: `https://reminiscent-basilisk-934.convex.site/workos/action`

Required frontend vars:
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_WORKOS_CLIENT_ID`
- `VITE_WORKOS_REDIRECT_URI`

Required Convex vars:
- `WORKOS_CLIENT_ID`
- `WORKOS_API_KEY`
- `WORKOS_WEBHOOK_SECRET`
- `WORKOS_ACTION_SECRET`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `NOTIFICATIONS_FROM_EMAIL`

## Staging

- App origin: `https://staging.example.com`
- Redirect URI: `https://staging.example.com/auth/callback`
- Convex site URL: `https://staging.example.convex.site`
- WorkOS webhook URL: `https://staging.example.convex.site/workos/webhook`
- WorkOS action URL: `https://staging.example.convex.site/workos/action`

Required vars match dev/prod contract.

## Prod

- App origin: `https://app.example.com`
- Redirect URI: `https://app.example.com/auth/callback`
- Convex site URL: `https://prod.example.convex.site`
- WorkOS webhook URL: `https://prod.example.convex.site/workos/webhook`
- WorkOS action URL: `https://prod.example.convex.site/workos/action`

Required vars match dev/staging contract.

## Failure Handling

If matrix validation fails:
1. Fix missing/invalid keys in `config/security/environment-matrix.json`.
2. Ensure `.env.example` and `convex/.env.example` include all required keys.
3. Re-run `npm run security:env`.
