# Wow Redesign: Phase 7, Calm Mode

The fourth step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## The three views
| View | What it is | Who gets it |
|---|---|---|
| Flight | The 3D story | Capable devices, by default |
| Calm | One framed still at a time, crossfading, with Previous, Next, a rail and J/K/arrows/Esc | Reduced motion, no WebGL, software renderers, and any crash or lost context in the flight |
| Timeline | The whole story as one page (`StoryArticle`) | Anyone who picks "Read as timeline", and a crash in calm mode |

JavaScript off still shows the article.

## What changed
- **`storyView.ts` and `ClientWrapper.tsx`:** the choice of view moved out of the 3D code, so calm mode doesn't download three.js: 240 kB of JavaScript against 797 kB for the flight, compressed.
- **Toggles:** "Reduce effects" during the flight; "Read as timeline" and "Play the 3D flight" in calm mode; "One beat at a time" in the timeline.
- **Explicit choices** are saved in `localStorage` and win over the defaults, so a reduced-motion visitor can opt in to the flight. A device that can't fly never gets it. Fallbacks after a failure aren't saved. `?view=` also works.
- **Your place carries over** through the URL hash, in every switch.
- **Removed:** `fallbackPlan.ts`, replaced by `storyView.ts`.
- **Reduced-motion first paint** now shows the loader until the view is chosen, not the article, so the page doesn't jump from one to the other.

## Bugs found and fixed along the way
- **Deep links landed at the start.** Lenis caches the page height, and the page is briefly short while the 3D code loads, so a jump clamped to the top (`scrollEngine.ts`).
- **Article ids clashed with flight links,** so article sections now use `timeline-<slug>`.
- **Calm controls sat below the fold** on a 900 px window. They're now pinned, and the frame height is limited.

## Verified (production build, Chrome)
- Reduced motion, software renderer, no WebGL, renderer failure and lost context all land in calm mode, with no canvas.
- With JavaScript off, the article shows.
- Fresh load of `#radiosim` flies to that beat. Flight to calm keeps the beat. Calm to flight keeps the beat. Calm to timeline scrolls to the beat.
- Arrow, Next, Esc and the rail move the step and focus the heading.
- Choices persist across reloads. Unit tests cover the view rules.
- Typecheck, lint on the story code and tests pass. No horizontal overflow at 375 wide.

## Choices to review
- **Stepped, not scrolled:** calm mode moves on Next, not on scroll.
- **No swipe and no rail on phones:** phones use Previous and Next, or the timeline.
- **"Play the 3D flight" stays offered under reduced motion,** as an explicit opt-in.
- **Wording:** "Reduce effects", "Read as timeline", "Play the 3D flight" and "One beat at a time".

## Not yet verified
- VoiceOver in calm mode, and on real phones, the Ubuntu PC, Firefox and Safari.
- A long beat on a very short window, where the pinned bar covers more of the text until you scroll.
