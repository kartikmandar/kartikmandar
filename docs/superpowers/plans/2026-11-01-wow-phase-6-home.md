# Wow Redesign: Phase 6, Home Page

The first route of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **Hero** (`components/Home/HomeHero`): the oversized serif name, "Searching for Signals", and the one-line positioning. The owner removed the proof chips and the tile tags (journal names, HERA, GSoC) after review.
- **Black hole loop** (`HeroLoop`): 8 s, 1280×720, H.264, 2.55 MB, rendered from the real raymarcher. The 53 kB AVIF poster paints first. The video loads after hydration, is skipped under reduced motion or data saver, and pauses off screen. There is no live WebGL on home.
- **"Enter the story"** (`StoryPortal`): a photon-ring link. A dark circle opens from the pointer and fills the screen, then it navigates. It goes to `/my-story/preview` until the Phase 7 cutover. The menu still links to `/my-story`.
- **About** (`HomeAbout`, `Portrait`): the existing photo as a CSS duotone with pointer parallax. The research and freelance copy is kept, and the first line now says Catania.
- **Selected work** (`SelectedWorkGrid`, `data/selectedWork.ts`): a bento of six tiles with RadioSim as the feature. RadioSim links to the renamed repo, which fixes the old link.
- **Project index** (`ProjectIndex`, `data/projectIndex.ts`): the full list, plus Merakinist Labs and without the matvis row (owner's call).
- **Content:**
  - Dropped the unbenchmarked fftvis speedups, in `data/projects.ts` too. "Accepted in RASTI" is now "Published in RASTI".
  - The homelab row now describes the clusters as earlier work (PROFILE.md §9, resolved 2026-10-30).
  - "Ada-e-Haandi" is now "Catering Business Website", under the no-client-names rule.
- **Current status:** the footer now says MSc Astrophysics, and the footer and contact page give the University of Catania instead of the RRI address.
- **First-load fix** (`lib/navigationState`): above-the-fold headings could play their entrance on a fresh page load and sit blank for a moment, because parts of the page hydrate after the route template's effects run. First load is now decided by comparing routes.
- **Cookie card:** moved to bottom-right above the audio button, because it covered the hero copy at bottom-left.
- **Removed:** `components/AboutHero` and `blocks/ProjectsShowcase`, which only the old home page used.
- **Capture tooling:** `window.__captureFrame(t)` in capture mode, and `scripts/home-loop/` (receiver, blend, encode).

## Re-rendering the loop
1. `pnpm build`, then `next start`, and show the browser so rAF runs.
2. Run `receiver.mjs <frames-dir>`, then open `/my-story/preview?capture=1&p=0.178&t=20&ui=0` at 1600×900.
3. In the page, call `__captureFrame(20 + i / 24)` for `i` in 0..227 and POST each blob to `http://127.0.0.1:3999/f0000.png` and so on.
4. Run `blend.mjs <dir>` (expects `<dir>/frames` and `<dir>/final`). It crossfades the last 1.5 s over the first and writes the poster.
5. Compile `encode.swift` with `swiftc`, then run `encode <dir>/final public/media/home/blackhole-loop.mp4 2400000`.

## Verified (production build, in-app browser)
- Typecheck, lint, 154 tests and the build pass; no console errors.
- The video plays (8 s, 1280 wide) and the portal wipes, then lands on `/my-story/preview`. No horizontal overflow at 1440 or 375 wide.

## Not yet verified
- A deliberate-eye check of the loop seam, and the reduced-motion and data-saver paths.
- Real phones, the Ubuntu PC and Firefox, and the mobile LCP target on a real network.
- The plan's 5-second test with 3 people.

## Departures from the plan
- **H.264 only, no AV1.** ffmpeg isn't installed, so the macOS encoder made the loop. The file still meets the 3 MB limit.
- **No cursor-following thumbnails in the index.** None of the indexed projects has an image yet.
- **Weak tile art.** The Selected Work images are the existing posters and logos, and the RadioSim tile still shows the old RRIVis name.
