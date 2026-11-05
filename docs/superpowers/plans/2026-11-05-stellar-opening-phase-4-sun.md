# Stellar opening, Phase 4a: the Sun's path

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 4, first path). Scene P3 from the spec (§6); copy lines 17-23 (§8).

## What was built

- **`pathStage.ts`**, a pure schedule for each path over the 720 vh path segment, sharing its scroll equally among the path's lines (as the overlay does).
  - Every path writes the same `PathStarState`, which `OpeningStage` applies to its star, halo, planets and leftover dust:
    - temperature
    - glow and glow size
    - halo
    - surface radius and opacity
    - the radius inside which planets are swallowed
    - orbit widening
    - debris
  - Paths not built yet hold the steady main-sequence star (`steadyStar`).
  - `sunPath` adds the helium flash, the shedding, the expansion, the ionization and the nebula's brightness. It starts from the chosen mass's own temperature, so a 2.5 M☉ star on this path doesn't jump in colour.
- **The Sun's life, line by line:**
  - **17:** steady fusion, brightening slightly.
  - **18:** it swells into a red giant (3,300 K) to 0.95 disk units, swallowing the two innermost worlds (orbits 0.62 and 0.86). The world at 1.1 survives, in line with "Earth's fate is uncertain" (§3.2); the copy says "the inner planets". The giant's wind clears the old dust.
  - **19:** the helium flash. A faint glow pulses at the core, seen through the giant, while the surface doesn't change at all (a test checks this): "From outside, nothing shows."
  - **20:** it shrinks and heats to burn helium calmly (4,800 K), then swells again (3,000 K). Thermal pulses make the surface throb, and shells of shed gas drift out, dimly lit.
  - **21:** the last of the envelope leaves. The bare core (about 100,000 K) is a hot point, and the shells light up as a planetary nebula: oxygen blue-green inside, hydrogen red outside, with knotted filaments.
  - **22:** a white dwarf, about 25,000 K. The nebula fades. The surviving planets drift out, as the star's weaker pull lets their orbits widen.
  - **23:** it cools and dims toward 7,000 K. No black dwarf is drawn, since none exists.
- **`scenes/SunPath.tsx`** draws the giant's surface (huge convection cells, limb darkening), the flash, and three nebula shells. It is always mounted (so `Precompile` covers it) and visible only on this path.
- **Camera:** over the second half of any path it backs away (3.6 units out, 1.2 up), so a nebula or, later, a supernova fits on screen.

## Found along the way

- **The followed clump's gas came back.** Since Phase 3 the cocoon clears during the planets, and the clump's own gas, which had been hidden behind the cocoon, reappeared as a red haze round the star. It now stays hidden once the core has heated.
- **AgX tone mapping changes two things:**
  - It greys out cool colours. The giant's surface gets a saturation boost and a lower exposure, so it reads orange-red, not beige.
  - It shows small linear values (0.05 to 0.15) as mid-grey, so faint emission summed over six shell faces read as solid filled balls. The nebula's rims are now tight, with no emission across the face, so the shells read as glowing shells with dark interiors.
- **The halo filled the nebula.** The star's 5-unit halo, turning blue-white as the core was bared, glowed inside the nebula. A bare core now has almost no halo; the nebula carries the glow.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 230 tests) and `pnpm build` pass.
- New tests (`pathStage.test.ts`):
  - It starts as the steady star the ignition left, at the chosen mass's colour.
  - Events come in the copy's order.
  - It turns red as a giant and very hot once bare.
  - It swallows the inner orbits but not the outer ones, and the outer orbits widen.
  - The surface doesn't change during the flash.
  - The nebula fades and the white dwarf cools.
  - The pulses stop when time stops (reduced motion).
  - Paths not built yet hold the steady star.
- Production renders on this Mac's GPU, in capture mode:
  - Desktop 1280 x 800: each of lines 17-23, the hand-off, and beat 1 unchanged.
  - Phone 390 x 664: the giant, the nebula and the cooling white dwarf.

## Not verified

- **Motion:** the thermal pulses and the nebula's drift were seen only in stills.
- **Frame timing** (Phase 7). The new cost is three 5-subdivision icosahedra drawn twice each (double-sided) and one 64x48 sphere, only on this path.
- **The flash** is very faint by design. If line 19 reads as "nothing happens", it could become a cutaway hairline round the core instead.
- **The giant is orange rather than deep red.** That is honest for about 3,300 K, but a reader of "red giant" may expect redder.
- **No second science review** of the path.

## Stop

The owner checks the Sun's path before the massive path.
