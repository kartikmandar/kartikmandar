# Stellar opening, Phase 7: mobile check and performance

Spec: `docs/superpowers/specs/2026-11-04-stellar-life-cycle-opening-design.md` §11. Built 2026-11-06.

## Method

- Production build (`next build`, `next start`).
- Desktop: Google Chrome in a visible window (real vsync), Apple M1 Max at 120 Hz. The window is 1024 x 868, so the canvas is 2026 x 1562 at DPR 2.
- `?perf&star=<path>`. Each opening segment is scrolled at constant speed, about 7 s per 260 vh, and the path's 720 vh takes 19 s. The hand-off band also gets 7 s. Each segment is read with `__journeyPerf.summary()`, like Phase 0.
- "Reveal" is the loader's fade. "After loader" is the 1.5 s that follow it.
- Phone: Chrome emulation at 390 x 664, DPR 3, touch, a phone user agent, and CPU 4x slower, on the same Mac.

## Found and fixed

### 1. The resolution dropped to the floor about 14 s after load (pre-existing, since the Lenis/flow phase)

drei's `PerformanceMonitor` counts every 2.5 s window above its upper bound as a "flip", even when its factor is already 1. On a machine that keeps up, it reaches `flipflops={4}` after about 12.5 s. `onFallback` then set the DPR to the tier's minimum:
- desktop: DPR 2 to 1, half the resolution
- phone tier: 1.25 to 1

The resize itself was a 35 to 50 ms frame at 4x CPU, and at a typical scroll pace it landed in the protostar. Canvas widths logged during a sweep: 2026 px, then 1013 px at 14 s.

**Fix** (`index.tsx`): `onFallback` keeps the DPR the monitor reached, `adaptiveDpr(quality, factor, …)`, rather than 0. When frames really are slow, `TierGovernor` still steps the tier down. The monitor's normal `onChange` is unchanged.

**What this means for earlier numbers:** every sweep since the monitor was added measured most of the page at DPR 1. That includes this spec's Phase 0 baseline after its first segment.

### 2. At full DPR 2 the cloud put the opening over budget

With the fix in, the Sun path measured p95 11 to 12 ms from the protostar to the hand-off, with p99 up to 29 ms. The flight's beats measured 9.3 ms at the same DPR. A/B test, hiding only the cloud: every segment returned to p95 9.2 to 9.4 ms. The cost comes from 7 overlapping billboards, each running 4-octave value noise on every pixel they cover.

**Fix** (`OpeningStage.tsx`):
- **Its own target.** The cloud draws into a target of its own, at most `CLOUD_PIXEL_RATIO` pixels per CSS pixel:
  - high: 1
  - low: 0.75
  - mobile: 0.6, which is about half of mobile's DPR 1.25, as §11 / O1 asks
- **Blended back in place.** A full-screen quad blends the target back at the cloud's own `renderOrder` 2, in premultiplied alpha. That gives the same "over" result as drawing the billboards directly.
- **Off-screen when invisible.** A billboard the camera is passing through (`uDensity * vFade` = 0) is collapsed in the vertex shader.
- **No noise outside the mask.** Pixels outside the elliptical mask `discard` before the noise.
- **The image is unchanged.** At DPR 2, stills before and after differ by a mean of 0.07 to 0.11 levels out of 255. 0.14 to 0.29% of channels differ by more than 12, which is film grain and point sprites. Crops reviewed side by side.
- **Posters weren't recaptured,** because the difference is below what they show.

## Results after both fixes (desktop, DPR 2, p95 / max in ms, frames over 50 ms)

| Path | Cloud | Protostar | Choice | Planets | Ignition | Path | Hand-off | Frames > 50 ms after loader |
|---|---|---|---|---|---|---|---|---|
| Sun | 9.3 / 15.3 | 9.3 / 9.7 | 9.3 / 9.6 | 9.2 / 12.9 | 9.2 / 10.1 | 9.3 / 10.3 | 9.3 / 10.1 | 0 |
| Massive | 9.3 / 19.6 | 9.2 / 9.6 | 9.3 / 11.2 | 9.3 / 15.6 | 9.3 / 10.8 | 9.3 / 11.2 | 9.3 / 9.8 | 0 |
| Very massive | 9.2 / 19.9 | 9.3 / 9.6 | 9.2 / 9.9 | 9.2 / 10.6 | 9.2 / 9.5 | 9.2 / 10.2 | 9.2 / 9.4 | 0 |
| Red dwarf | 9.3 / 19.5 | 9.2 / 9.5 | 9.3 / 11.0 | 9.2 / 9.6 | 9.3 / 9.8 | 9.3 / 9.8 | 9.3 / 9.8 | 0 |
| Brown dwarf | 9.3 / 18.8 | 9.2 / 9.6 | 9.2 / 11.5 | 9.3 / 13.1 | 9.3 / 11.6 | 9.3 / 9.8 | 9.3 / 9.9 | 0 |
| First stars | 9.2 / 17.9 | 9.3 / 11.7 | 9.3 / 11.9 | 9.2 / 10.5 | 9.0 / 9.3 | 9.3 / 12.1 | 9.2 / 9.5 | 0 |

- **All within the target** of p95 ≤ 9.4 ms. p50 is 8.3 ms everywhere, a clean 120 Hz.
- **The loader's fade** has a worst frame of 12 to 38 ms. The 1.5 s after it stays at 9.4 ms or under.
- **For comparison, the flight's four quarters** (same DPR) measure p95 9.3 ms, max 13.6 to 17.6 ms.
- **The cloud segment's single 15 to 20 ms frame** is the first scroll after the loader.

## Phone emulation (CPU 4x slower)

p95 is 9.4 to 9.9 ms in every segment, on the mobile tier, for every path. There are no errors and no canvas resize. On this Mac's GPU that only shows the CPU side keeps up at 4x slower.

**One frame of 55 to 74 ms** appears in 4 of 6 runs, at the start of the choice. That's 0.0625 of the page, where the protostar segment ends.
- **What it is:** a Long Animation Frame entry names React's commit (`MessagePort.onmessage` in react-dom), 51 ms of script with 34 ms of forced style and layout.
- **Where it comes from:** the overlay's `useLayoutEffect` runs SplitText on the new line, which measures its lines. The choice line costs the most because it also mounts the slider, readout and six preset buttons.
- **On desktop** the same frame stays under 12 ms.
- **Left as is.** Every copy change on the site uses this pattern, so it isn't specific to the opening. Whether it shows on a real phone is for the owner's device check. If it does, a fix could mount the choice controls a frame after the split, or split before the controls mount.

### 3. On phones the choice's last row of buttons ran into "Skip story"

At 390 x 664, the rail's "Skip story" label sits 19vh minus 20 to 34 px from the bottom, and it overlapped the "First stars" button.

**Fix:**
- `Overlay.tsx` gives lowered lines (the choice and the lifetime line) the class `journey-lowered`.
- `globals.css` adds, under the phone media query: `padding-bottom: max(9vh, 92px, calc(19vh - 10px))`.
- Desktop is unchanged.
- The camera's portrait framing follows the copy's top, so the star and disk move up with it and stay clear. Reshot at 390 x 664.

**LCP**, in the cutover note's simulation (390 x 664, 1.6 Mbps, 150 ms latency, CPU 4x slower, cache off), three runs: 1.13, 1.42 and 1.14 s. The LCP element is the loader backdrop every time, so it stays under 2.5 s. The loader leaves at about 8.4 to 8.6 s on this profile, against "about 7 s" in the cutover note. The opening has more to compile behind the loader.

**Mobile tier counts:**
- The trunk already reduces cloud billboards (7 / 5 / 4), noise octaves (4 / 4 / 3), fragments, disk and jet particles.
- The very massive wind reduces its particles (5000 / 3000 / 1600).
- The other path bodies are single 64 x 48 spheres with the shared 4-octave noise, the same as the flight's beats already shipped on phones.

## Verified

- `tsc --noEmit`, `pnpm lint`, `pnpm test` (34 files, 292 tests), `pnpm build`.
- Desktop sweeps for all six paths, and a flight sweep for comparison.
- Phone sweeps for all six paths: the mobile tier, no errors, no canvas resize.
- Cloud stills before and after, compared by pixel difference and by eye.
- All 18 opening stills at 390 x 664 with text and controls: text readable over every scene. The one overlap found is fixed in item 3 above.

## Not verified

- **Real phones.** Every phone number here comes from this Mac's GPU, so it says nothing about a phone's GPU, heat or memory. The owner's iPhone and Android check from the earlier Phase 7 is still owed, and now covers the opening too.
- **Low tier and DPR 1 desktops,** where the cloud now renders at 0.75 pixels per CSS pixel or at full resolution.
- **The 300 ms flash limit** and the sound, by eye and by ear, carried over from Phase 6.
