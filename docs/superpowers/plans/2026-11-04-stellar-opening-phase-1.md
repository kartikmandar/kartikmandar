# Stellar opening, Phase 1: the black hole opener removed

Date: 2026-11-04. Plan: `2026-11-04-stellar-opening-plan.md`.

## What changed

- **Scroll split.** `prologueScroll.ts` is now `openingScroll.ts`: `OPENING_FRACTION` 0.235 plus `HANDOFF_BAND` 0.025. The flight still starts at 0.26, so every beat keeps its scroll position. `splitProgress` returns `inOpening`, `openingProgress`, `handoff` and `flightProgress`.
- **Per-frame state.** `journeyFrame.prologue` is now `opening`, `crossfade` is now `handoff`, and `covered` is gone.
- **Opening copy and schedule.** `openingStory.ts` holds the approved §8 copy, the six paths with their preset masses, and the §5 segments: cloud 260, protostar 240, choice 220, planets 260, ignition 180, path 720 vh. The 200 vh hand-off is the band. Each segment shares its scroll equally among its lines. The overlay shows the Sun's path until Phase 3 adds the choice.
  - The brown dwarf has no ignition line in §8, so its ignition segment shows line 10 ("It stopped short...") and its path segment shows lines 11 and 12.
  - The first stars path uses the heavy-star planet and ignition lines (7 and 9) like the massive paths.
- **Removed:** `ProloguePass.tsx`, `prologueDive.ts`, `prologuePhase.ts`, `CoverAware.tsx`, `HERO_PHASES`, `ORIGIN_BLACK_HOLE`, and the tests for the dive and phase schedule.
- **Kept but unmounted:** `scenes/OriginBlackHole.tsx`. Phase 4 reuses it for the very massive path. `QuasarBackground/engine` is still imported by it, so nothing there was deleted.
- **Key light.** The origin black hole also carried the warm point light that lights beats 1 and 2. It is now `OriginLight` in `index.tsx`: same colour, intensity and distance, rising across the hand-off band, always mounted so the shader programs keep the same light count.
- **No pop-in.** The beats stay hidden until the hand-off band starts (and during warm-up). `Environment` raises the fog to 0.1 over the opening, which hides the first station 26 units ahead, and eases it back to 0.045 across the band, so the station emerges out of the fog. Phase 2 scenes near the camera should set `fog={false}` or account for this.
- **Sound.** `storyMix` takes a generic `swell` instead of `crossfade`. For now the hand-off drives it; Phase 6 moves it to each path's ending.
- **Calm mode.** The first step now holds the trunk and choice lines. A new step, "A star like the Sun" (`#like-the-sun`), holds the rest of the Sun's path and the hand-off line. Both use the stars-only loader backdrop until Phase 6 adds posters, which makes 34 calm steps.
- **Article.** A new section, "How a star lives and ends", has the Sun's path in full. Phase 6 adds the other paths and the formula sentence.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (27 files, 183 tests) and `pnpm build` all pass.
- The narrative snapshot diff only removes `HERO_PHASES`. No beat text changed.
- Production build in the browser pane:
  - Desktop pane, 768 px tall: page height 61,419 px, or 7,997 vh, the same as before.
  - Opening lines show at the start (line 1), at 0.19 (line 20, the Sun's helium burning) and at 0.25 (the hand-off line).
  - J from the opening lands on "The Spark: NAO" at 0.2646 with `#nao`, and beat 1 is lit by the key light.
- Phone, 390 x 664, mobile tier: page height 53,102 px. Line 3 shows at 0.04 and wraps cleanly.
- Calm mode, entered with "Reduce effects", shows the new first step with the backdrop poster and "1 of 34".
- No console errors.

## Not verified

- Frame timing was not measured. The opening now draws only the sky, so it should be cheaper than the raymarch, but Phase 7 measures it.
- Sound wasn't listened to.
- Reduced motion, the timeline view and the no-JavaScript article weren't checked in the browser. The article's markup is covered by `storyArticle.test.tsx`.
- Posters weren't recaptured. Nothing in the beats changed.

## Stop

The owner checks that the flight and beat positions are unchanged before Phase 2.
