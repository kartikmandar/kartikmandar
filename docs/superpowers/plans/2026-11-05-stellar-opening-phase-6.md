# Stellar opening, Phase 6: calm mode, article, posters, sound and loader

Spec: `docs/superpowers/specs/2026-11-04-stellar-life-cycle-opening-design.md` §10. Built 2026-11-05.

## What was built

- **One list of stills** (`openingStills.ts`): the trunk's cloud, protostar and choice, two or three stills per path (14 in all), and the night sky, each with its page progress and path. Calm mode and the poster script both read it; capture mode publishes it as `window.__storyOpening`.
- **Posters.** `capture-posters.mjs` now captures the opening's stills too, with `?star=` for each path, and takes `--origin=` (no environment variable). `encode-posters.mjs` skips the share image when its beat wasn't captured. 18 new files, `public/media/my-story/opening-*.webp`, 13 to 56 kB each (533 kB in all). Three stills were moved after review: the cloud to its clumps, the supernova to the shell and pulsar (the first position caught only the collapsed core), the brown dwarf's cooling to a dim ball (the first was nearly empty).
- **Calm mode** follows the chosen path: the cloud, a young star, the choice (preset buttons, `aria-pressed`, the mono readout, `?star=` written with `replaceState`), the path's stills with the planets and ignition lines in the first, the night sky with "Try another star", then beat 1. Slugs are the still names, so `#choose` matches the flight's. Step count is 38 or 39 by path.
- **Article.** "How a star lives and ends": the trunk and the Sun's path in full, the lifetime formula sentence, then each other path under its preset label with one or two of its own approved lines (`pathSummary`), then the hand-off line.
- **Sound.** The sub swell left the hand-off. `openingSwell` places it at ignition (a low rise, 0.4, none for the brown dwarf) and on each ending: the massive and first-star supernovae in full, the very massive collapse at 0.8, the helium flash soft at 0.45, nothing for the dwarfs. `storyMix` takes a `level`.
- **Loader.** The point of light no longer scales 70x to ignite; it grows to 3x, cools to the cloud's dusty blue, blurs and fades. `IGNITE_MS` and the `igniting` stage are renamed `REVEAL_MS` and `revealing`.
- **Photosensitivity** (open since Phase 4). `limitRamp` in `art/anim.ts`: brightness may cross its range no faster than 300 ms, however fast the scroll. Applied to the star's ignition and glow (with every ending's outburst) in `OpeningStage`, the massive shock's glow, the first star's debris glow and the helium flash. It snaps in capture mode and warm-up, and when a scene first appears, so posters stay exact.

New copy written here, for the owner to approve: calm-mode step headlines ("A young star", "Mass of the star", "A red giant", "A white dwarf", "A red supergiant", "A supernova", "A black hole", "A long future", "Cooling", "Nothing left", "Many stars later"; the first path still uses the preset label). Every paragraph is approved copy.

## Verified

- `tsc --noEmit`, `pnpm lint`, `pnpm test` (34 files, 292 tests; new: `calmSteps`, `anim`, sound and article cases, posters for every still), `pnpm build`.
- All 18 stills reviewed on a contact sheet from the real GPU renderer.
- Calm mode in the browser: preset click writes `?star=massive`, presses the button and updates the readout; `#night-sky` deep link, K back through the massive stills to the choice, "Try another star" back to the choice with focus on its heading, J into the path. Screenshots at 1440 x 900 and 390 x 664.
- The article's opening section in the timeline view: all five other paths and the hand-off line.
- Loader sampled in headless Chrome: scale 1 to 3, colour to rgb(143, 166, 196), opacity to 0 in about 900 ms, then removed.

## Not verified

- Sound by ear. The mix is unit-tested only.
- The 300 ms limit by eye on a fast scroll, and frame timing (Phase 7).
- A screen reader on the calm preset buttons.
- Reduced motion beyond what already existed: calm mode is the reduced-motion view, and the path scenes freeze their clocks; nothing new was wired.
- Calm mode doesn't follow a hash change on the same page (pre-existing): only a load reads the hash.
- At 900 px tall, the calm choice step's readout sits under the pinned controls until the page scrolls.
