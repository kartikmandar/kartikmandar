# Wow Redesign: Phase 7, Cutover

The cutover step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-02 with the owner's go-ahead. **Local only: it reaches visitors when `main` is pushed. The real-device check in `2026-11-02-wow-phase-7-mobile-parity.md` should come first.**

## What changed
- **`/my-story` is now the flight,** with the static article, the three views, the canonical URL, Article and Breadcrumb JSON-LD, and the share image.
- **`/my-story/legacy`** holds the previous page for one release. It's `noindex`, and its canonical is `/my-story`.
- **`?legacy`** goes to that page from `ClientWrapper.tsx`. It isn't in `redirects.js`, because Next's `has` matching doesn't see a query key with an empty value, so `?legacy` would not match.
- **`/my-story/preview`** now redirects to `/my-story` (307), keeping its query and hash. The route was on GitHub, so old links keep working.
- **`isStoryFlight`** matches `/my-story` exactly, so the legacy page keeps the site's top bar and scrolling.
- **Also updated:** the home portal link, the capture script and the sitemap date.
- **Loader backdrop:** `loader-backdrop.webp` (20 kB) is preloaded and sits behind the title and point of light.

## Mobile LCP
Simulated: 390 x 664, 1.6 Mbps, 150 ms latency, CPU 4x slower, cache off, three runs each.

| | LCP | LCP element |
|---|---|---|
| Without the backdrop | 5.77-5.80 s | First prologue line, which waits for the 3D code |
| With the backdrop | 1.12-1.38 s | The backdrop |

The target is under 2.5 s. This number comes from a simulation on an M1 Max, so it isn't a real phone reading.

**What LCP doesn't show:** the flight itself still takes about 7 s to start on this profile. The backdrop gives slower connections something real to look at sooner, but the wait is unchanged.

## Backdrop
- **Stars only:** every beat's poster has art and labels that would clash with the title, so this is a stars-only part of a captured frame, stacked with a copy of itself turned 180 degrees.
- **Short of the full window:** it stops 3% from the top and bottom, because Chrome doesn't count a viewport-filling image as LCP. Chrome's rule is the reason for this inset, so it could need changing if that heuristic changes.
- **It isn't scripted.** Stars rarely change, so `encode-posters.mjs` doesn't produce it.

## Verified (production build, Chrome)
- `/my-story`, `?view=calm`, `?view=timeline`, `?legacy`, `?legacy=1`, `/my-story/legacy` and `/my-story/preview` all land correctly, and the preview redirect keeps the hash on a fresh load.
- The home portal reaches the flight, and client navigation to `/about` brings the top bar back.
- Metadata in the server HTML: title, canonical, `og:image`, `og:url`, both JSON-LD blocks, and all beat headings. No old block in the HTML.
- The sitemap lists `/my-story`, but not the preview or legacy routes.
- A frame-by-frame recording of the load shows no flash as the loader changes hands (steady brightness until ignition).
- No console errors and no failed requests. Typecheck, lint on the changed code and 206 tests pass.

## Known remaining
- **Hash changes on an open page don't move the flight.** A fresh load of `#radiosim` flies there, but editing the hash in place doesn't, because `JourneyNav` has no `hashchange` listener. This isn't new, and nothing on the site links that way.
- **`og:image` and canonical use the local URL here.** They come from the server URL setting, so they need checking once deployed.

## Not yet verified
- Real phones, the Ubuntu PC, Firefox and Safari. Safari matters for the `mask-image` on the backdrop, which is unprefixed.
- A real social share preview, which needs a public URL.

## After a clean week, with the owner's OK
Retire `/my-story/legacy`, `?legacy`, the `CosmicJourney` block and `QuasarBackground`'s live use.
