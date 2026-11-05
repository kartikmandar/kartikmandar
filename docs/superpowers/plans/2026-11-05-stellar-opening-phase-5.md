# Stellar opening, Phase 5: the hand-off and the finale's new rhyme

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md` (Phase 5). Spec §6 (O8), §8 (hand-off), decisions 9.4 and 9.9.

## What was built

- **The night-sky hold** (`openingScroll.ts`). The hand-off band now has two parts:
  - First the remnant recedes while the camera curves onto the flight's first position, and the full sky fades up.
  - Then a quiet hold on the night sky under line 36, for the last third of the band.
  - New helpers:
    - `HANDOFF_ARRIVE` (0.65) is where the camera arrives.
    - `handoffPresence` controls how much of the opening's scene is left (gone by 0.6).
    - `handoffFogClear` makes the fog clear only from 0.55 to 1, so the first station still comes out of the fog at the end instead of popping in.
  - All six path scenes, the opening stage and the very massive path's black hole now share `handoffPresence`; it replaces eight copies of the old inline fade.
  - The first stars' sparse sky is full again before the hold starts.
- **"Try another star"** (`TryAnotherStar.tsx`, decision 9.4).
  - It sits under line 36 and is a real link to `#choose`.
  - A plain click flies back to the choice and focuses the slider (`jumpToChoice`, exported from `JourneyNav`).
  - A modified click falls through to the link, so it can open in a new tab, which lands on the choice the same way.
  - It uses the ember accent for its arrow and border on hover.
- **The chapter rail's opening tick.** A small ring sits above the rail. Its label is "Choose a star", and it does the same as the link. It is a ring rather than a dash because the opening sits outside the beats' numbering.
- **The finale's rhyme** (`Beat_Finale.tsx`, decision 9.9).
  - A small blue-white first star lights up at the centre of each ionized bubble, just before the bubble grows. It is a slow ramp (about 10% of the beat), never a flash.
  - Each star rides with its bubble as the bubbles converge, and fades into the ring.
  - The eclipse alignment, the ring and the 21-cm pulse are unchanged, and so is the text.
  - The acceptance notes in `beatsMeta.ts` no longer mention "the opening photon ring".

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (32 files, 260 tests) and `pnpm build` pass.
- New tests:
  - The camera arrives at `HANDOFF_ARRIVE` and holds perfectly still until beat 1.
  - The opening scene is gone before the hold.
  - The fog clears only through the end of the hold, without stepping back.
  - The first stars' sky is full by the hold.
- Production renders on this Mac's GPU, in capture mode:
  - **Desktop 1280 x 800:**
    - The recede, mid-hold and late hold, for the Sun and first stars paths.
    - Beat 1, unchanged.
    - The finale at 12%, 25%, 40%, 55% and 70% of the beat.
  - **Phone 390 x 664:** the hold with the link, and the finale's stars and bubbles.
- On the live page (not capture mode), driven over CDP at 1280 x 800 and 390 x 664 with real mouse events:
  - From the hand-off hold, "Try another star" lands on the choice with the slider focused, the chosen mass kept (`?star=massive`) and the hash `#choose`.
  - J then goes to beat 1 (`#nao`), and the rail's opening tick lands back on the choice.
  - No exceptions.

## Not verified

- **Motion.** The hold, the stars' ramp and the flight back to the choice were seen only in stills and as end states. A long jump from the hand-off back to the choice passes through the whole path segment in reverse.
- **The ring in the finale** still has a dark centre like a black hole's shadow. The spec keeps the ring for the eclipse alignment; whether the shadow should go is the owner's call.
- **A square edge on the eclipse ring's plane.** It shows while the plane slides in (70% render). This predates this phase.
- **A real screen reader** on the link and the rail ring.
- **Frame timing** (Phase 7).

## Stop

The owner checks the hand-off and the finale before Phase 6.
