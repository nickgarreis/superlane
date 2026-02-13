# WorkOS Linked Logins: Current Problem Statement

## Date
- February 13, 2026

## User assertion to preserve
- The two login methods used for testing should already be synced in WorkOS because authentication lands in the same app user account.
- We are treating this as a valid premise for this incident analysis.

## Observed behavior
- In Settings > Account, the UI shows only the most recent login method used in the current session.
- Expected behavior is to show all linked methods (for example Email + Google).

## Expected behavior
- The account auth section should render multiple rows when identities are linked:
  - Current method
  - Other linked providers
  - Email row when password credentials are linked

## Why this is still possible even with the same app account
- The UI renders from `linkedIdentityProviders` persisted on the `users` row plus current session method.
- If `linkedIdentityProviders` is empty/stale, UI falls back to the current session provider only.
- Therefore, same-account authentication does not guarantee the local `linkedIdentityProviders` cache is currently populated.

## Current suspected failure boundary
- The issue is likely in synchronization freshness/persistence (app-side cache population), not in basic session authentication.
- Specifically, the sync path that writes `linkedIdentityProviders` may not have run successfully, or data may not have been written/read as expected for the affected user.

## What should be verified next
1. Confirm the affected user row has non-empty `linkedIdentityProviders` in Convex.
2. Confirm the post-auth sync action executes and succeeds for that user session.
3. Confirm the read path (`getAccountSettings`) returns those providers to the frontend.
4. Confirm UI receives and maps non-empty provider list.

## Linked docs (created during this implementation thread)
- Plan file record: [13-02-2026_11-12_workos-linked-logins-plan-file.md](docs/13-02-2026_11-12_workos-linked-logins-plan-file.md)
- Implementation record: [13-02-2026_11-24_workos-linked-logins-implementation.md](docs/13-02-2026_11-24_workos-linked-logins-implementation.md)
- AccountTab split refactor: [13-02-2026_11-33_accounttab-component-split.md](docs/13-02-2026_11-33_accounttab-component-split.md)

## Scope note
- This file records the problem and assumptions only.
- It does not claim root cause has been proven yet.
