# Suppression Pattern Regex State Fix

**Date:** 2026-02-09 21:56  
**Type:** Quality script reliability fix

## Summary

Updated the suppression-check script to remove global regex flags from blocked comment patterns. This prevents stateful `lastIndex` behavior when `.test()` is called repeatedly across lines.

## Change

- Updated `BLOCKED_PATTERNS` in `/Users/nick/Designagency/scripts/quality/check-suppressions.mjs`:
  - from: `[@ts-ignore/g, /@ts-expect-error/g, /eslint-disable(?:-next-line|-line)?/g]`
  - to: `[/@ts-ignore/, /@ts-expect-error/, /eslint-disable(?:-next-line|-line)?/]`

## Verification

- `node --check /Users/nick/Designagency/scripts/quality/check-suppressions.mjs` ✅
- `node /Users/nick/Designagency/scripts/quality/check-suppressions.mjs` ✅

