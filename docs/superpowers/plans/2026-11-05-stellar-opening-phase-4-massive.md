# Stellar opening, Phase 4b: the massive path

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 4, second path). Scene P4 from the spec (§6); copy lines 24-28 (§8).

## What was built

- **`pathStage.ts`**: `massivePath`, a pure schedule over the path segment's five lines, writing the shared star state plus:
  - the cutaway
  - the burning shells
  - the core collapse
  - the shock radius and glow
  - the neutrinos
  - the pulsar

  `pathStar` now dispatches over a `PathStates` bundle (one state object per drawn path, so frames don't allocate).
- **The massive star, line by line:**
  - **24:** the steady hot blue star from ignition.
  - **25:** it swells into a red supergiant (3,500 K). An octant facing the camera is cut away. Its flat faces show the burning shells as rings, each appearing in turn, heavier elements later and deeper: hydrogen, helium, carbon, neon, oxygen, silicon, iron. The shells are not to scale; the real core is far smaller.
  - **26:** the iron core shrinks to nothing; silicon sags behind it.
  - **27:**
    - The core rebounds. A bright ring (the shock) stalls just outside it, with a faint teal glow inside: the neutrinos heating it.
    - The shock then revives and runs out through the star. The envelope fades as the shock passes.
    - The light peaks as the shock breaks out of the surface, then falls. This is tied to the shock's radius, a scroll-driven exposure ramp, never a screen flash.
  - **28:** a neutron star: a tiny hard blue-white point, with two beams on a magnetic axis tilted from the spin axis, so they sweep round. The shock's ring spreads, cools from gold to ember, and fades as it reaches the camera.
- **`scenes/MassivePath.tsx`**:
  - One sphere, cut open analytically: each pixel's ray is traced in the sphere's own frame against the cut octant. Where the octant isn't cut, it shades the surface (huge convection cells, limb darkening). On the cut faces, it colours each point by the shell its radius falls in, with thin dark lines between shells, like a textbook cutaway. The stalled shock and the neutrinos are drawn on the cut faces too.
  - The shock outside the star is a camera-facing disc with a limb-brightened ring and knots of debris.
  - It is always mounted, so `Precompile` covers it, and is visible only on this path.

## Found along the way

- **Nested double-sided transparent spheres don't work for a cutaway.** Drawn that way, the envelope's inside face came out over the shells inside it. Debug renders confirmed the shells drew correctly on their own. Rather than fight how three.js sorts and draws them, the cutaway is now a single analytically traced sphere: one draw call instead of seven, with flat cut faces like a real diagram.
- **Bloom, on the composited tiers, smears any bright limb across a whole shell.**
  - The phone tier (no composer) showed the shock correctly, which gave it away.
  - The shock ring stays under the bloom threshold.
  - The outburst brightens the core's glow without growing it.
- **The bounce no longer changes the supergiant's surface colour.** The envelope keeps 3,500 K until the shock reaches it.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 236 tests) and `pnpm build` pass.
- New tests:
  - It starts as the steady blue star.
  - It becomes a cut-open cool supergiant by the end of line 25.
  - The core collapses during line 26, before any shock.
  - The shock stalls just outside the core while the neutrinos glow and the envelope still stands, then the envelope is gone.
  - The explosion's light changes smoothly, never jumping.
  - It ends with a neutron star and the shock gone past the camera.
- Production renders on this Mac's GPU (`?star=massive`, capture mode):
  - Desktop 1280 x 800: each line, the stalled shock, the breakout, the pulsar, the end of the path, and beat 1 unchanged.
  - Phone 390 x 664: the cutaway, the stalled shock and the pulsar.
  - The Sun's path was re-checked: unaffected.

## Not verified

- **Motion:** the beams' sweep, the shock's spread and the collapse were seen only in stills.
- **The exposure ramp's speed:** it follows the scroll, so a very fast scroll compresses it. The photosensitivity rule (§10) asks for ramps of at least 300 ms. Smoothing the outburst over time would guarantee that. Worth doing before Phase 7.
- **Frame timing** (Phase 7). The cutaway is one traced sphere with a 4-octave fbm surface, on screen for about two lines.
- **No second science review.**
  - The shells are deliberately not to scale.
  - The neutron star is drawn as a point (about 25 km is far below a pixel).
  - Beam colour and width are artistic.

## Stop

The owner checks the massive path before the very massive path.
