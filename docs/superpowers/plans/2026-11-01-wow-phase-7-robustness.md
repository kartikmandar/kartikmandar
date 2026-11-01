# Wow Redesign: Phase 7, Robustness

The second step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **Pre-flight (`tiers.ts`, `robustness.ts`):** the WebGL probe now asks for `failIfMajorPerformanceCaveat` and reads the renderer name. Software renderers (SwiftShader, llvmpipe, Microsoft Basic Render) get the article. Capture mode is exempt. The probe also gives its context back.
- **`StoryBoundary` (`ClientWrapper.tsx`):** a crash in the flight, or a failed download of the 3D code, reveals the article and returns to the top.
- **Renderer creation (`index.tsx`):** R3F builds the renderer in an async step that error boundaries can't see, so a failure there left the loader on screen forever. The story now builds the renderer itself and catches that.
- **`ContextGuard`:** a lost WebGL context gets 4 seconds to come back. If it doesn't, or on the third loss in a visit, the article takes over.

## Every failure, forced in Chrome on the production build
| Failure | Result |
|---|---|
| Real GPU (Apple M1 Max) | Flight runs, no errors |
| Software renderer (SwiftShader) | Article, no errors |
| Renderer can't be created | Article. This was stuck on the loader until the fix above. |
| 3D code fails to download (6 chunks blocked) | Article |
| Context lost, then restored | Flight continues and renders correctly (seen in the prologue and a later beat) |
| Lost a second time, restored | Flight continues |
| Lost a third time | Article |
| Lost and never restored | Flight at 2 s, article by 5 s |

Typecheck, lint, 185 tests and the build pass. These failures log their own errors to the console, as expected, and the healthy flight logs none.

## Choices to review
- **Limits:** 4 seconds and 3 losses are judgement calls and haven't been tuned on phones.
- **No message:** a visitor who falls back simply gets the article, with no note saying the 3D version couldn't run.
- **Position:** falling back returns to the top rather than the beat they were on.

## Not yet verified
- **A real context loss.** These were forced through `WEBGL_lose_context`. iOS under memory pressure is the case that matters, and it needs the owner's iPhone.
- Real phones, the Ubuntu PC, Firefox and Safari.

## Not covered
- **An error inside the render loop** isn't caught by the boundary, so a scene that throws every frame wouldn't fall back.
- **A very slow 3D download** stays on the loader. There is no timeout, because a slow phone may still finish.
- **If the main site JavaScript fails to load,** the loader stays up, because nothing can run to remove it.
