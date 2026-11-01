# Wow Redesign: Phase 7, Scene Bleed

A fix found by the poster capture, ahead of the cutover. Built 2026-11-01. **Signed off by the owner on 2026-11-01, after scrolling the flight.**

## The problem
At a beat's midpoint, neighbouring scenes stayed fully visible, and the previous station sat 1 unit behind the camera, so its art could fill the frame. See "Finding" in `2026-11-01-wow-phase-7-posters.md`.

## The fix
- **Station spacing** goes from 8 to 18 units (`beatsMeta.ts`). During a hold, the previous scene is 11 units behind the camera and the next is 25 ahead, in the fog.
- **`beatVisible` (`cameraPath.ts`):** a neighbour draws only while the camera travels to or from it, so a held shot shows just its own scene. This runs per frame, with no React update.
- **Stars** now travel with the camera (`Environment.tsx`). The fixed shell would have ended before the longer flight did.
- **Nebula** points scale with the corridor, to keep their density: 9,000 on desktop, 1,350 on phones.
- The scenes themselves are unchanged. This is why I didn't add per-scene fades, which would have meant touching 31 scenes and their custom shaders.

## What this changes in the feel
- **Travel is 2.25 times the distance in the same scroll,** so the moves between beats are faster. This needs the owner's eye.
- **The camera now flies through each scene early in its departure,** so art zooms past close up for a moment (Comet, Cygnus's star, the dish in Doubling Down).
- **Doubling Down's dawn sky** still shows its hard horizon during that move. It is that scene's own art, not bleed, and is only on screen briefly.
- **Stars are denser** behind the art, because of the nebula scaling and fewer scenes covering them.

## Verified (production build)
- All 31 beats captured at their midpoints as visitors see them: no neighbouring art in any.
- 25 frames across 5 transitions, plus the prologue hand-off and the ending, reviewed by eye.
- Real-time scroll through the whole flight on the M1 Max: median 8.3 ms, p95 9.3 ms, p99 9.4 ms, worst 25 ms. No console errors.
- Posters recaptured, so they match. Typecheck, lint on the story code, 190 tests pass.

## Not yet verified
- Weaker GPUs and phones, where more nebula points and faster moves cost more.
- Whether a neighbour pops in visibly at the start of travel with the camera's real lag. Capture mode has no lag, so stills can't show it.

## Left alone
- Beat art itself, including the comet sky's lower edge.
