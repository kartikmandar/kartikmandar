# Wow Redesign: Phase 7, Server-Rendered Story

The first step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## Phase 7 order
1. Server-rendered story article (this step).
2. Robustness: lost WebGL contexts, an error boundary, software-renderer detection.
3. Poster capture: stills per beat for calm mode, OG images and loader backdrops.
4. Calm mode and a "Reduce effects" toggle, which need the posters.
5. Mobile parity, which needs the owner's iPhone and Android.
6. Audio, which needs a licensed or commissioned score.
7. Cutover of `/my-story`, which asks the owner first.

## What changed
- **`StoryArticle`:** the title, prologue, all 31 beats and the ending are semantic HTML from `narrative.ts`, so there is one source for the text.
- **How it shows:**
  - During the flight it stays in the document, visually hidden, with its links out of the tab order.
  - Under reduced motion, with no JavaScript or with no WebGL, it is the page.
- **Removed:** `Fallback.tsx` and its gradient placeholders. The article replaces them.
- **Screen readers:** the flight's text no longer announces itself on every beat change, and the loader no longer has a second page title.
- **Article JSON-LD** on the preview page (`generateStorySchema`). Canonical and index settings move with the cutover.
- **Tests:** `vitest` now also runs `.test.tsx`. `storyArticle.test.tsx` covers every headline, body, phrase and link.

## Fixed along the way: the loader in every page's HTML
`app/(frontend)/loading.tsx` wrapped all routes in a Suspense boundary. React outlines large boundaries, so every static page's HTML began with the telescope loader and held the content in a hidden block until a script swapped it in. With JavaScript off, every page showed the loader forever.

- The file now lives at `search/loading.tsx`, the only route that needs it.
- Static pages now start with their content in the HTML.
- **Trade-off:** in-site navigation has no loading fallback. On slow 4G none of the 4 tested routes needed one.
- The Phase 6 "no spinner" result was wrong and is corrected in `2026-11-01-wow-phase-6-done-when.md`.

## Verified (production build)
| Condition | Article | Canvas | Loader | Height |
|---|---|---|---|---|
| Normal flight | Hidden (1 x 1), links -1 | Yes | Gone | 71,976 px |
| Reduced motion (emulated) | Visible | No | Gone | 10,262 px |
| JavaScript off | Visible | No | Gone | 10,262 px |
| WebGL disabled | Visible | No | Gone | 10,262 px |

- Typecheck, lint on the changed files, 172 tests and the build pass; no console errors in any condition.
- One `h1` and 32 `h2`s (31 beats plus the ending).
- 13 static routes have no loader in the HTML. A rerun of the Phase 6 checks still passes: home LCP 1.08 to 1.55 s in simulation, keyboard flows, and reduced motion.

## Not yet verified
- **VoiceOver:** the plan's "each beat read once" hasn't been tested with a real screen reader. The beat in view can be read twice, because its heading stays exposed as the keyboard focus target.
- Real phones, the Ubuntu PC, Firefox and Safari.

## Left for later steps
- No images in the static article until posters exist (step 3).
- Static mode has no visible rail or toggle, and no site footer. It ends with its own links.
- The narrative's journal club link still goes through the `/journal-club` redirect.
