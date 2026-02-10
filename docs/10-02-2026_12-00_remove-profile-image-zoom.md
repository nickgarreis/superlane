# Remove Profile Image Zoom Animation in Account Settings

**Date:** 10-02-2026

## What Changed

- **File:** `src/app/components/SettingsPopup.tsx`

## Root Cause

The CSS `animate-in fade-in duration-200` was applied to the outer overlay div, which contained both the backdrop AND the modal content. This caused the entire modal (including the profile avatar) to fade from opacity 0→1 over 200ms. A circular element fading in against a dark/blurred backdrop creates a perceived "zoom out" optical illusion — the circle appears to expand as its edges become opaque.

## Fix

Separated the backdrop from the modal content into sibling elements:

- **Backdrop div** (`fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200`) — still fades in smoothly
- **Modal content div** — no longer wrapped in the fading parent, so it appears instantly with no opacity animation

Also added `initial={false}` to `AnimatePresence` to skip the framer-motion enter animation on first mount (the motion.div's opacity 0→1 + y translation), while keeping tab-switch animations intact.

## Result

- Profile image appears instantly when the popup opens — no zoom/scale effect
- The dark backdrop overlay still fades in smoothly
- Tab switching still animates with the slide+fade transition
