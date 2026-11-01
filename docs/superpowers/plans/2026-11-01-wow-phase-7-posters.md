# Wow Redesign: Phase 7, Posters

The third step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **`scripts/capture-posters.mjs`:** captures all 31 beats from the real renderer on this machine's GPU, in headless Chrome, in about a minute. It refuses to run on a software renderer.
- **`scripts/encode-posters.mjs`:** writes `public/media/my-story/<beat>.webp` and `share.jpg`.
- **Capture mode:** `&solo=1` renders only the active beat, and `window.__storyBeats` gives each beat's midpoint.
- **Static article:** each beat now shows its poster. Posters are `display: none` during the flight, so they aren't downloaded there.
- **Share image:** the Cygnus X-1 still, 1200 x 630, on the preview page. It moves to `/my-story` with the cutover.
- **Comet sky:** softer edges, so it reads less like a rectangle. This also changes the live flight.
- **`posters.test.ts`:** every beat needs a poster under 200 kB, and the share image must exist.

## Re-capturing
1. `pnpm build`, then `pnpm start`.
2. `node scripts/capture-posters.mjs <png-dir> [beat-id ...]`
3. Review the PNGs.
4. `node scripts/encode-posters.mjs <png-dir>`

## Sizes
31 posters at 1600 x 900 total 955 kB (largest 60 kB), and the share image is 36 kB. After the scene-bleed fix added nebula points, the recapture totals 1,413 kB, and the share image is 53 kB.

## Departures from the plan
- **WebP only, not AVIF and WebP.** `next/image` serves AVIF from the master anyway, so a second master would add nothing.
- **One share image, not one per beat.** Beats have no URLs of their own to share.
- **Loader backdrop isn't done.** It's left for the cutover step, where `/my-story` LCP is measured.

## Finding: neighbouring scenes bleed into the live flight
The first capture showed each beat as visitors see it. The active beat's neighbours stay fully visible, and the previous station sits just 1 unit behind the camera, so its art can fill the frame. Examples at beat midpoints on a 1600 x 900 window:
- **RadioSim:** a huge "HDE 226868" label and the Cygnus companion star over the scene, on a pale blue wash.
- **Engineer:** a brown wash and large grey bars from a neighbouring scene.
- **Decision and journal club:** a neighbouring sky plane with a visible edge.

The posters avoid this with `solo=1`. Fixed afterwards in `2026-11-01-wow-phase-7-scene-bleed.md`.

## Verified (production build)
| Mode | Posters downloaded | Failed requests |
|---|---|---|
| Normal flight, scrolled through | 0 | 0 |
| Reduced motion (emulated) | Lazy: 3 at load, 20 after scrolling | 0 |
| JavaScript off | All 31 | 0 |

- Typecheck, lint on the story code, 187 tests and the build pass.
- `og:image` is in the HTML and the share image returns 200.
- All 31 stills were reviewed by eye, on contact sheets.

## Worth a look
- **Share image number:** it shows "R in 4.3 Rg", a mid-animation value. The profile gives 5.5 to 2 Rg, so it's in range but isn't a quoted result.
- **Composition:** art sits high in most stills because the flight keeps the lower third for text, so the bottom of many stills is empty.
- **Comet:** the sky is softer but still has a visible lower edge.

## Not yet verified
- A real social share preview, which needs a public URL.
- Real phones, the Ubuntu PC, Firefox and Safari.
