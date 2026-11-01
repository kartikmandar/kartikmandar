# Wow Redesign: Phase 6, Shared Card System

The second step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **`components/ContentCard`:** one server-rendered card with three variants.
  - `feature`: image-backed tile (home Selected work).
  - `row`: wide card with an optional side image (talks, posters, open source).
  - `compact`: image on top (posts, related posts).
  - `CardAction` is the shared link button. It stays clickable above a card-wide link.
- **Cursor spotlight:** an ember border and soft glow follow the pointer. One document listener (`CardSpotlight`, mounted in the layout) drives every card, so cards ship no JavaScript of their own. It is off on touch and under reduced motion, where cards keep a plain hover border.
- **Whole-card links:** a stretched link on the title replaces the `useClickableCard` hook, which is deleted. Middle-click, keyboard focus and screen readers now get a real link.
- **Blur placeholders:** `scripts/generate-blur-data.mjs` writes `data/blurData.generated.ts`. Re-run it after adding images to `public/media`.
- **Rollout:** home tiles, talks, posters, open source, posts, and related posts (through the existing `Card` adapter). Section headings on those pages moved to the display serif.
- **Small changes:**
  - Post dates now use one fixed format ("April 20, 2026").
  - The literal "No image" text on image-less post cards is gone.
  - Talk tags are de-duplicated.
  - Poster abstracts are no longer justified.
  - The talk status moved from a pill to the eyebrow line.

## Verified (production build, in-app browser)
- Typecheck, lint, 154 tests and the build pass; no console errors.
- Spotlight: a real pointer hover sets the position and shows the border and glow.
- Clicking a post card's image opens the post. "View materials" sits above the card and opens a new tab.
- Blur placeholders appear while images load. No horizontal overflow at 375 wide on home, talks, posters, open source or posts.

## Not yet verified
- Related posts: the post I opened has none, so that card placement hasn't been seen in the browser.
- Real phones, the Ubuntu PC and Firefox.
- A keyboard-only pass over the cards, and reduced motion.

## Left out on purpose
- The home project index stays a plain list, not cards.
- Search results keep their own rows.
- The open-source page's content refresh (RadioSim, hera_pspec and so on) is a later Phase 6 step.
