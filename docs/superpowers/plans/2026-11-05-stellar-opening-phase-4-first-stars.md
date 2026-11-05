# Stellar opening, Phase 4f: the first stars path

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 4, sixth and last path). Scene P6 from the spec (§6); copy lines 32-35 (§8).

## What was built

- **`pathStage.ts`**:
  - `firstStarsPath` writes the shared star state plus:
    - the sparse sky
    - a cutaway
    - pair production
    - the core falling in
    - oxygen ignition
    - the debris shell's radius and glow
  - `skyDensity(path, t, handoff)` gives how much of the sky to draw.
  - `PathStates` gains `firstStars`. Every path is now drawn, so `pathStar` no longer falls back to `steadyStar` (it is still where each path starts).
- **The first star, line by line (`?star=first-stars`):**
  - **32:** a huge blue star in a nearly empty sky: the Environment's stars and nebula thin to about 15%.
  - **33:** an octant is cut away, showing the hydrogen envelope, a helium mantle and a large oxygen core. White sparkles through the core stand for light turning into electron-positron pairs. The core then shrinks by 30% and the mantle sags after it.
  - **34:** a gold burning front runs out from the centre of the core: oxygen igniting all at once. A gold debris shell breaks out of the surface, and the star fades as the shell passes it. The light peaks as the shell breaks out and is tied to its radius, so it ramps with the scroll and never flashes the screen.
  - **35:** the shell spreads, cools toward rose and fades as it passes the camera. Nothing is left at the centre: no point of light, no halo. The full sky returns over the hand-off.
- **`scenes/FirstStarsPath.tsx`**:
  - One analytically cut sphere, the same technique as the massive and red dwarf paths.
  - The debris shell reuses the massive path's camera-facing shell shaders, now exported from `MassivePath.tsx`.
- **`Environment.tsx`**: the sky thins by drawing only the first part of the star and nebula buffers (`setDrawRange`). Their points are in random order, so a shorter range is a sparser random sky. This costs nothing per frame and is back to the full range for every other path and from the hand-off on.

## Found along the way

- **The star first read as a grey moon.** A 55,000 K blackbody is nearly white, and AgX tone mapping greys it further. The surface now leans 70% toward the palette's blue, with saturation pushed back, at an exposure that blooms softly.
- **The explosion began too slowly.** With an eased start and a squared radius, the star was still whole in the middle of line 34. The shell now grows on a linear ramp squared, so the star is gone by the middle of line 34 and the debris passes the camera in line 35.
- **The shell first rendered grey** (near-white under AgX); it is now hot gold, cooling to rose.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 257 tests) and `pnpm build` pass.
- New tests:
  - It is a huge blue star in a sparse sky in line 32.
  - The sky thins only on this path and is full again after the hand-off.
  - Pairs form before ignition, and the core falls in before any blast.
  - Ignition comes in line 34 and blows the whole star apart.
  - Nothing is left: no glow, and the debris is past the camera.
  - The explosion's light changes smoothly.
  - `pathStar` draws this path.
- The "paths not drawn yet" test was removed: there are none left.
- Production renders on this Mac's GPU, in capture mode:
  - Desktop 1280 x 800: lines 32 to 35, the pair sparkle, ignition, the blast, the empty end, and beat 1 with the full sky back.
  - Phone 390 x 664: the cutaway and the blast.

## Not verified

- **Motion:** the pair sparkle, the burning front and the shell's spread were seen only in stills.
- **The exposure ramp's speed:** like the massive path, it follows the scroll, so a very fast scroll compresses it below the 300 ms the photosensitivity rule asks for. The fix belongs to both paths (smoothing the outburst over time) before Phase 7.
- **The surface** is a fairly flat pale blue at this size. It reads as hot, but it has less texture than the supergiants.
- **The opening's other clumps** (the orange fragments from the trunk) stay in the sky. On this path they slightly undercut the "early Universe" look.
- **Science, not reviewed a second time.**
  - The layers are not to scale.
  - The temperature, about 55,000 K from the existing table, is lower than models give for a metal-free 200 M☉ star (about 100,000 K). It is drawn the same either way, since the colour scale tops out.
  - The pair sparkle and the rose colour of the debris are artistic.
- **Frame timing** (Phase 7). One traced sphere and one shell disc.

## Stop

Phase 4 is complete: all six paths are drawn. The owner checks the first stars path before Phase 5 (the hand-off with "Try another star", and the finale's rhyme).
