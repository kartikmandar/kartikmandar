# Stellar opening, Phase 4c: the very massive path

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 4, third path). Scene P5 from the spec (§6); copy lines 29-31 (§8).

## What was built

- **`pathStage.ts`**: `veryMassivePath`, a pure schedule over the path segment's three lines. Besides the shared star state, it writes:
  - the wind
  - stripping to a Wolf-Rayet core
  - the star vanishing
  - a weak outburst, capped at 0.35
  - the black hole
  - the glow of the little gas still falling in

  `PathStates` gains `veryMassive`.
- **The very massive star, line by line (`?star=very-massive`):**
  - **29:** a hot blue-white star with a strong wind: gas streaming straight out in all directions at a spread of speeds, fading as it spreads. The wind clears what dust was left.
  - **30:** stripped to a bare Wolf-Rayet core: smaller, harder and hotter. Its wind turns teal (Wolf-Rayet winds glow in broad helium and carbon lines) and speeds up. The wind's clock accumulates, so the speed change never jumps.
  - **31:** the star goes dark, with at most a faint outburst. Once the core has fallen in, the wind is no longer fed: its inner edge moves outward, leaving the last gas as a thinning shell. A small black hole appears where the star was: a shadow with a faint inner glow and photon ring, from the existing raymarched impostor, never a bright disk.
- **`scenes/VeryMassivePath.tsx`**: the wind as one shader-driven point cloud. Counts by tier: 5,000, 3,000 and 1,600.
- **`scenes/OriginBlackHole.tsx`**, adapted rather than rewritten:
  - It now takes a `look()` callback (opacity, infall) instead of reading the hand-off, and reads its centre from where it is mounted.
  - Its march steps no longer depend on the tier (56 everywhere), because a tier-dependent material can be disposed while `compileAsync` waits on it (the Phase 2 lesson).
  - The unused warm point light was removed, since `OriginLight` in `index.tsx` lights the first beats.
  - It is mounted at the opening stage's root, outside the tilted, scaled disk frame, because the impostor works in world units.

## Found along the way

- **The impostor drew a full accretion disk.** Its `uIgnition` uniform lights the disk from the inside out. At 0.25-0.55 it drew a large, bright disk that read as a feeding quasar, not "a weak explosion or none at all". Infall now peaks near 0.12, which lights only the innermost ring and a faint photon ring around the shadow.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 240 tests) and `pnpm build` pass.
- New tests:
  - It starts as the steady star.
  - It has a full wind by the end of line 29 and is a smaller, hotter, stripped core by the end of line 30.
  - There is no black hole before line 31, and it is dark with a black hole at the end.
  - The outburst never exceeds 0.35.
  - The glow changes smoothly.
- Production renders on this Mac's GPU, in capture mode:
  - Desktop 1280 x 800: the wind, the Wolf-Rayet wind, the collapse, the black hole with line 31, the end of the path, and beat 1 unchanged.
  - Phone 390 x 664: the Wolf-Rayet wind and the black hole.
  - The Sun's nebula and the massive path's pulsar were re-rendered: unaffected.

## Not verified

- **Motion:** the wind's streaming and the thinning shell were seen only in stills.
- **Frame timing** (Phase 7). The impostor marches up to 56 steps per pixel over a small screen area; the wind is one draw call.
- **The science, not reviewed a second time.**
  - The black hole is drawn far larger than real; a real one would be a few tens of kilometres across, far below a pixel.
  - The spec's note that many such stars leave a neutron star is carried by the copy's "may", not shown.

## Stop

The owner checks the very massive path before the red dwarf path.
