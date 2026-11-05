# Stellar opening, Phase 4e: the brown dwarf path

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 4, fifth path). Scene P1 from the spec (§6); copy lines 10-12 (§8).

## What was built

- **`pathStage.ts`**:
  - `brownDwarfPath` writes the shared star state plus `deuterium` and `cooling`.
  - `pathCameraZoom` now closes in on the brown dwarf too: in at the start of line 11, held while it cools, out for the ending.
  - `PathStates` gains `brownDwarf`, and `pathStar` dispatches to it. Only the first stars path still holds the steady star.
- **The brown dwarf, line by line (`?star=brown-dwarf`):**
  - **10** (ignition segment, from Phase 3): the core settles without igniting. It is a faint point, with no ignition exposure ramp.
  - **11:** the camera closes in on a small ball, about Jupiter's size, with muted cloud bands. A faint rose glow from the middle of the disc shows deuterium burning (millions of years at 0.05 M☉; Spiegel et al. 2011). The glow fades out before the line ends, leaving only leftover heat. The old dust drifts away.
  - **12:** it cools from about 2,800 K to about 600 K (through the L, T and Y types; Burrows et al. 2001). It dims to nearly black, shrinks a little and leans further toward magenta, while the camera backs out. The two small worlds keep their orbits.
- **`scenes/BrownDwarfPath.tsx`**: one sphere with a plain shader (banded clouds turning faster at the equator, limb darkening, the deuterium glow). It is the cheapest path, as the spec asks.

## Found along the way

- **The first render looked like an orange Jupiter.** A 2,800 K blackbody is orange, and strong bands read as a planet lit by a sun. The colour now leans 60-90% toward a deep magenta, because real brown dwarfs look magenta: sodium and potassium absorb yellow and green. The bands are muted, since the clouds are lit by its own heat. The deuterium glow uses the palette's rose (`hydrogen`) instead of ember.
- **The orange halo argued with the magenta surface**, so it was dimmed (0.25 of the main-sequence halo, fading to nothing as it cools).

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 251 tests) and `pnpm build` pass.
- New tests:
  - It starts as the faint point.
  - It burns deuterium in line 11 before any cooling.
  - Only leftover heat is left from line 12.
  - It cools steadily, dims and shrinks a little, ending at 600 K and nearly black.
  - Its worlds are never engulfed or moved.
  - The camera zooms in for most of the path and is back out at the end.
- Production renders on this Mac's GPU, in capture mode:
  - Desktop 1280 x 800: lines 10, 11 and 12, the end of the path, and beat 1 unchanged.
  - Phone 390 x 664: lines 11 and 12.

## Not verified

- **Motion:** the bands turning and the deuterium glow's slow breathing were seen only in stills.
- **Line 10's look** is Phase 3's: the disk's dust haze around the faint point is fairly bright for a body that never ignites. It is worth a look alongside the hand-off work in Phase 5.
- **The temperatures are rounded.** A 50 Jupiter-mass brown dwarf is nearer 1,000 K after ten billion years; 600 K is where the drawn cooling ends, to suggest "never quite a star" going dark, and the line names no temperature.
- **Frame timing** (Phase 7). This adds one sphere with a 4-octave fbm, twice per pixel.

## Stop

The owner checks the brown dwarf path before the first stars path.
