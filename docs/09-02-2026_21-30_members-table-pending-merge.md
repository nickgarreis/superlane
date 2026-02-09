# Members Table: Merge Pending Invitations Inline

**Date:** 2026-02-09 21:30
**Type:** UI Improvement

## Summary

Merged pending invitations into the unified "Members" table in the Company settings tab, replacing the previous separate "Pending Invitations" section.

## Changes

### `src/app/components/SettingsPopup.tsx`

1. **Added `RotateCcw` icon import** from lucide-react for the resend action button.

2. **Renamed heading** from `Active Members (N)` to `Members (N)` — count now includes both active members and pending invitations.

3. **Pending invitations rendered as member rows** in the same list:
   - Same row layout, padding, and hover styling as active member rows.
   - Dashed-border avatar circle with first letter of the invited email.
   - Email shown as primary text (slightly dimmed) with an amber "Pending" badge.
   - Role and expiry date on the sub-line.
   - Icon-style action buttons: `RotateCcw` for resend (blue hover), `X` for revoke (red hover), both with `title` tooltips.

4. **Removed the separate "Pending Invitations" section** — no more duplicate heading or different layout for invited users.

## Files Modified

- `src/app/components/SettingsPopup.tsx`
