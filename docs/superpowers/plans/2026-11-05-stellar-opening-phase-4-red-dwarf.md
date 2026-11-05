# Stellar opening, Phase 4d: the red dwarf path

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 4, fourth path). Scene P2 from the spec (§6); copy lines 13-16 (§8).

## What was built

- **`pathStage.ts`**:
  - `redDwarfPath` writes the shared star state plus a cutaway, the ghosted prediction, heating and shrinking.
  - `pathCameraZoom(path, t)` tells the camera how far to close in on a small star.
  - `PathStates` gains `redDwarf`.
- **The red dwarf, line by line (`?star=red-dwarf`):**
  - **13:** the camera closes in on a small red star with a mottled surface. An octant is cut away, and the cut faces show convection loops churning all the way to the centre, because the star is fully convective below about 0.35 M☉ (§3.2).
  - **14:** the cut closes and the camera backs out to the star with its planets. Under the line, a hairline timeline draws the star's whole life to scale, with the Universe's age so far marked on it: a sliver at the very start (about 0.6% at 0.15 M☉). The captions read "Now · 13.8 billion years" and "Its life · about 2 trillion years", taken from the same lifetime table as the choice readout.
  - **15:** the predicted future, drawn faded and partly greyed, with a dashed outline. The star heats up (a "blue dwarf"), then shrinks into a tiny helium white dwarf. It is a model prediction (Laughlin et al. 1997), so it is drawn that way.
  - **16:** the prediction fades and the red dwarf returns as it is today. "None has done this yet."
- **`scenes/RedDwarfPath.tsx`**: one analytically cut sphere (the same technique as the massive path's shells), plus a camera-facing dashed ring.
- **`LifetimeTimeline.tsx`**:
  - A `figure` with a text `figcaption`, so screen readers get the two figures as text.
  - It is shown through a new `aside: 'lifetime'` on the opening line that a path marks with `lifetimeLine`. Lines with an aside sit lower, like the choice.
  - On phones the captions stack.
- **`CameraRig.tsx`**: for paths that close in, the camera and its look target move together along the line to the star, so the star keeps its place on screen and grows.

## Found along the way

- **A 3,100 K blackbody is orange, and AgX tone mapping pushes it toward gold**, so the first renders showed a beige or gold star. The surface is now drawn at a lower exposure, leaning 60% toward the palette's deep ember, as red dwarfs are conventionally shown. The hotter predicted future isn't tinted.
- **The dashed ring vanished round the tiny white dwarf.** It now keeps a minimum readable size, and the halo dims during the prediction, so the white dwarf stays a point rather than a blur.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 245 tests) and `pnpm build` pass.
- New tests:
  - It is cut open during line 13 and closed by line 14.
  - It is unchanged through line 14.
  - The prediction is ghosted, hotter and tiny by the end of line 15.
  - It is back to today's red dwarf at the end.
  - The camera zoom applies only on this path and only around the cutaway.
- Production renders on this Mac's GPU, in capture mode:
  - Desktop 1280 x 800: each line, the blue-dwarf and white-dwarf stages of the prediction, and beat 1 unchanged.
  - Phone 390 x 664: the cutaway, the timeline (captions stacked, clear of the chapter rail) and the white dwarf.
  - The Sun's giant was re-rendered: unaffected.

## Not verified

- **Motion:** the convection's churn and the camera's move in and out were seen only in stills.
- **The prediction's temperatures:** about 6,500 K for the blue dwarf and 12,000 K for the young helium white dwarf are illustrative. The spec gives about 5,800 K for a 0.1 M☉ blue dwarf, and the line doesn't name a temperature.
- **The lifetime caption:** at exactly 0.15 M☉ it reads "about 2 trillion years" (interpolation lands just under 2.5). The spec's range is 2-3 trillion, and the line itself says "trillions".
- **Frame timing** (Phase 7).

## Stop

The owner checks the red dwarf path before the brown dwarf path.
