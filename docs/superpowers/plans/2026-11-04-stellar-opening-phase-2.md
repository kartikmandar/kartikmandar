# Stellar opening, Phase 2: cloud to protostar, disk and jets

Date: 2026-11-04. Plan: `2026-11-04-stellar-opening-plan.md`. Scenes O1-O4 and the O8 hand-off move from the spec (§6).

## What was built

- **`openingCamera.ts`**, a pure function of the opening and hand-off progress.
  - The opening's world sits at `OPENING_CENTER` (0, 0, 40). That is behind the flight's first camera position, so it is out of view once the flight starts.
  - The camera pushes into the whole filament over the cloud lines (75 units away to 34), then closes on the followed clump over the protostar lines (to 9 units). For the rest of the opening it drifts half a radian round the star.
  - Once the protostar appears, the camera looks a little below the star, so the star sits above the centred copy.
  - Over the hand-off band it curves past the star (beside it, clear of the disk and jets) and settles exactly on `ORIGIN_ANCHOR`. `CameraRig` uses this pose whenever `flight <= 0`.
- **`openingStage.ts`**, a pure schedule timed to the copy:
  - Line 2: the clumps fall in.
  - Line 3: the core heats inside the cocoon.
  - Line 4: the disk settles, then the jets switch on and clear cavities.
  - Some diffuse gas always stays, because most of a cloud never becomes stars.
  - The whole stage fades across the hand-off.
- **`scenes/OpeningStage.tsx`**, procedural and in the art kit's idiom. Motion lives in shaders; buffers are built once.
  - **Cloud (O1):** dark fbm billboards along a filament, drawn after the sky, so the dust hides the stars and a faint band of background starlight. The edges carry a faint cold rim. It uses 4 octaves, 3 on the mobile tier.
  - **Fragmentation (O2):** gas along the filament falls inside-out into seven clumps. Gas far from any clump stays diffuse. As it falls it warms from cold blue-grey to a dull red, not a glow.
  - **Protostar (O3):** a core sprite inside a dusty cocoon. Its light scatters out reddened, and the cocoon has soft edges. The followed clump's own gas fades as the cocoon forms.
  - **Disk and jets (O4):**
    - Gas falls from the cocoon onto a disk with Keplerian shear (angular speed ∝ r^-1.5). It is hotter and brighter inside, with a visible inner hole, and tilted close to edge-on.
    - Two collimated red jets with knots that move with the flow end in faint shocks. The jets open cavities through the cocoon.
  - Point counts by tier, from high to mobile: fragments 9,000 / 6,000 / 3,000, disk 14,000 / 8,000 / 4,500, jets 2,400 / 1,500 / 900.
- **The choice, planets, ignition and path segments** hold on the young star with its disk and jets until Phases 3 and 4 fill them.

## Found along the way

- **Materials must not depend on the tier.** If the tier changes while `compileAsync` is waiting, the old material is disposed and three throws in `checkMaterialsReady`, which leaves the loader stuck. The cloud's octave count is therefore a uniform, not a define.
- **The development server can't run the flight.** `pnpm dev` throws the same `checkMaterialsReady` error and falls back to calm mode, even with the new stage unmounted.
  - The production build does not.
  - I didn't look further, since it is outside this phase. It may come from React Strict Mode disposing materials in development.
  - It is worth a look before the next round of scene work, because development previews are faster to iterate with.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (29 files, 195 tests) and `pnpm build` pass.
- New tests:
  - The camera ends exactly on `ORIGIN_ANCHOR` with no jumps.
  - The stage's events come in the order of the copy, the disk and jets are complete before the choice, and the stage fades across the hand-off.
- Production renders in headless Chrome on this Mac's GPU, in capture mode (`?capture=1&p=…&t=12`):
  - Desktop 1280 x 800 (high tier): the cloud, the clumps, the cocoon, the disk with jets, the hand-off, and beat 1 unchanged.
  - Phone 390 x 664 (mobile tier): the cloud, the cocoon, and the disk with jets, which sit above the copy. Beat 1 is unchanged.
  - No console errors.

## Not verified

- Frame timing against the 9.4 ms p95 baseline isn't checked (Phase 7). The heaviest part is probably the cloud on the high tier: seven large fbm billboards seen from far away.
- Motion was only seen in still frames. The disk shear, jet knots and infall were not watched moving in a visible browser, because the browser pane was hidden for this session.
- Reduced motion freezes the stage's clock, but it wasn't looked at.
- The science is checked by reasoning, not reviewed again by a second reader:
  - Stars form along filaments, inside-out collapse, a cold dark cloud, a reddened embedded core, Keplerian disk shear, and bipolar jets with knots ending in red Herbig-Haro shocks.

## Stop

The owner checks the look and the science before Phase 3 (the choice, planets and ignition).
