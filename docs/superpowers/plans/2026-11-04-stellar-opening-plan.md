# Stellar life cycle opening: build plan

Spec: `docs/superpowers/specs/2026-11-04-stellar-life-cycle-opening-design.md`, approved by the owner on 2026-11-04 with every §9 recommendation and the §8 copy as drafted (hand-off line 36).

Each phase ends with a stop for the owner. After every phase: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm build`, screenshots at desktop and 390 x 664, and a dated notes file in this folder that says what was and wasn't verified. Nothing is pushed or merged without the owner's go-ahead.

## Phase 1: remove the black hole opener

- `prologueScroll.ts` becomes `openingScroll.ts`: `OPENING_FRACTION` 0.235 and `HANDOFF_BAND` 0.025. The flight still starts at 0.26, so every beat keeps its scroll position.
- `openingStory.ts` holds the approved copy (§8), the six paths with their presets, and the scroll schedule of the opening's segments (§5). The overlay shows the opening's lines one at a time on a plain night sky, following the Sun's path for now.
- Delete `ProloguePass.tsx`, `prologueDive.ts`, `prologuePhase.ts`, `CoverAware.tsx`, `HERO_PHASES` and their tests. `OriginBlackHole.tsx` stays on disk, unmounted, until the very massive path reuses it in Phase 4.
- `journeyFrame`: `prologue` becomes `opening`, `crossfade` becomes `handoff`, `covered` goes. The beats stay hidden until the hand-off starts, and denser fog over the opening clears across the hand-off, so the first station emerges instead of popping in.
- Calm mode's first step, the article's header and the sound's sub swell follow the rename. The calm step uses the stars-only loader backdrop until Phase 6 adds real posters.
- Stop: the owner checks that the flight and beat positions are unchanged.

## Phase 2: nebula to protostar and disk (O1-O4, O8)

Scenes at positive z ahead of `ORIGIN_ANCHOR`, with the opening's own camera path ending exactly on it. Stop: look and science.

## Phase 3: the choice (O5), planets and ignition (O6-O7)

Log-scale range input, presets, mono readout, `?star=` and `#choose`. Stop: interaction, keyboard, touch, screen reader.

## Phase 4: each path

Sun-like, then massive, very massive (reusing `OriginBlackHole`), red dwarf, brown dwarf, first stars. Stop after each.

## Phase 5: the hand-off and the finale's new rhyme

"Try another star", the night-sky hold, and the finale's bubbles around first stars. Stop.

## Phase 6: calm mode, article, posters, sound and loader

Stop.

## Phase 7: mobile check and performance

Against the Phase 0 baseline: p95 ≤ 9.4 ms on the M1 Max. Stop.
