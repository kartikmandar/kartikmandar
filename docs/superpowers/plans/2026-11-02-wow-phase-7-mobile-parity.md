# Wow Redesign: Phase 7, Mobile Parity

The fifth step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-02. **Committed with the owner's OK on 2026-11-02. The real-device check below is still owed.**

## Already in place
The mobile tier already had no post stack (no bloom), reduced particle counts and fewer raymarch steps.

## What changed
- **`TierGovernor`:** drops the quality tier at runtime when frames stay slow across two 3-second windows. It only goes down, and it ignores loading and tab switches.
- **30 Hz detection (`frameSignal`):** an even 30 Hz, such as Low Power Mode, reads as `capped` and stops at the low tier. Slower or uneven frame rates read as `struggling` and can reach mobile.
- **Phone resolution:** DPR 1 to 1.25.
- **8-bit fallback:** the post stack and prologue use 8-bit targets where half-float isn't renderable.
- **Address bar:** the canvas is `100lvh`, and scroll maths ignore height changes under 160 px at the same width (`steadyViewportHeight`).
- **Debugging:** `<html data-story-tier>` shows the tier in use.

## Layout problems the phone captures found
- **Cropped art:** a fixed 60-degree view cut scenes at the sides on portrait. `baseFov` now widens up to 100 degrees.
- **Art behind copy:** `portraitLift` shifts the image up 16% on portrait, and the scrim is stronger on phones.
- **Rail touching text:** it moves into the margin on phones.
- **"Reduce effects" over the evidence link:** beat text now clears the floating buttons.
- **HUD beside the top bar:** hidden on phones, because the beat's own eyebrow repeats it.
- **Bands behind prologue text (all screens):** SplitText's masks clipped `text-shadow` into rectangles. It's now a stacked `drop-shadow` filter over a soft radial shade, checked on every prologue line at desktop and phone sizes.

## Verified in Chrome, on this Mac's GPU
| Simulation | Result |
|---|---|
| Phone, 390 x 664, 3x, touch, CPU 4x slower | Mobile tier, canvas 487 px wide (DPR 1.25), no sideways scroll |
| True 30 Hz cap, measured at 33.3 ms | High to low, stays at low at 30 s |
| CPU 40x slower | High to mobile within 30 s, still running, no errors |
| Half-float extensions removed | Renders correctly (checked by eye), no errors |

All 31 beats were captured at phone size with text on and reviewed. Typecheck, lint on the story code, 206 tests and the build pass.

## This is not a phone test
- **Frame rates mean nothing here:** the GPU is an M1 Max, so the 60 Hz phone reading says nothing about a real phone.
- **The address bar couldn't be tested.** Emulation changes the real viewport, so it behaves unlike a sliding bar.
- **Also needs real phones:** heat, iOS memory limits, touch scrolling, and rail ticks that may be too small to tap.

## Owner's check (iPhone Safari and Android Chrome)
1. Scroll the whole flight at `/my-story/preview`.
2. Does the canvas jump when the address bar slides?
3. Is scrolling smooth, and does the phone get hot?
4. Is the text readable over every beat?
5. Try Low Power Mode. It should stay smooth at 30 Hz.

To see the tier in use, inspect `<html data-story-tier>` with remote debugging.

## Known remaining
- **Longest beats on short screens:** text still overlaps the art (Cygnus, Engineer, What I'm Working On). The text stays readable.
- **Colours differ on the mobile tier:** without the post stack, some art is more saturated, such as the Cygnus disk.
- **A tier drop rebuilds scenes,** so expect one brief hitch.
- **Console warnings, not errors:** GSAP "target not found" and a three.js `Clock` deprecation.
- **No automatic switch to calm mode** on a device still struggling at the lowest tier. "Reduce effects" stays available.
