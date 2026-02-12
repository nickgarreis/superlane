# Settings section gap consistency fix

**Date:** 12-02-2026 10:18

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Changed each settings section container to `className="scroll-mt-24 flex flex-col"`.

## Why
- Enforce consistent vertical section spacing by preventing margin-collapsing behavior from child section content, which could make one section transition appear tighter than others.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx` ✅
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
