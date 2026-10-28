# Wow Redesign: Phase 5 (Site Foundation)

Phase 5 of `2026-10-28-site-wow-redesign-plan.md`. Built 2026-10-28. **Signed off by the owner on 2026-10-28** after clicking around the new shell.

## What changed
- **Dark-only tokens** (`src/app/(frontend)/globals.css`):
  - OKLCH tinted near-blacks (hue 265) and the story's ember (`--ember`), mapped onto the existing shadcn names through `@theme inline`, so every page's `bg-card`, `text-muted-foreground` and so on resolves to the new palette without page edits.
  - A z-index scale (`--z-raised` … `--z-skip`), a `glass` utility, a `mono-label` utility, motion tokens and a fluid display scale (`text-display-md` … `text-display-2xl`).
  - A static 4% film grain over the site (not the story flight, which grains in post).
  - Removed the light theme: the `html{opacity:0}` hack, the `payload-theme` localStorage key, `InitTheme`, `ThemeProvider`, `HeaderThemeProvider`, `ThemeSelector` and every `setHeaderTheme` call. `<html>` is statically `dark`, so existing `dark:` utilities still apply.
  - Removed `scroll-behavior: smooth` (Lenis owns smoothing).
- **Fonts** (`src/app/fonts.ts`): Instrument Serif (display) + Inter (body) + JetBrains Mono, chosen by the owner. The story overlay's headlines, hero lines and "Let's talk." now use the display serif.
- **Motion system:**
  - `src/lib/motion.ts` holds the easings, durations, stagger and route helpers.
  - `MotionConfig reducedMotion="user"` is set site-wide.
  - Primitives in `src/components/motion`: `Reveal`, `Stagger`/`StaggerItem`, `MaskedLines` (GSAP SplitText line masks), `PageHeader`, `RevealImage` (clip-path wipe), `Magnetic`/`useMagnetic`, `CursorLabel` (`data-cursor="…"`).
  - `PageHeader` replaces the per-page gradient h1s.
  - Entrance animations skip the first page load (the server HTML is already painted), so there's no flash and no LCP cost.
- **Lenis at the root** (`src/providers/SmoothScroll`):
  - One instance with `syncTouch: false`.
  - Off entirely under reduced motion, and off on the story flight, which keeps its own Lenis.
  - Anchor links are offset below the top bar, and a fresh navigation to a `#hash` lands below the bar.
  - Back/forward keeps the browser's restored position.
  - `lockScroll()` (`src/lib/scrollLock.ts`) stops Lenis and native scroll while an overlay is open, and overlays carry `data-lenis-prevent`.
- **Route transitions:** `src/app/(frontend)/template.tsx` rises and fades each new page in (400 ms; 250 ms on /cv and /publications). The /my-story routes and the first load are excluded. The `RadioTelescopeLoader` is now pure CSS: the 150 DOM stars became two radial-gradient layers, the JS glow interval became a keyframe, and it fades in only after 250 ms.
- **Navigation:**
  - A slim top bar (`SiteChrome/TopBar`): serif name, search (⌘K) and Menu. It tucks away on scroll down and returns on scroll up. On the story flight only the two buttons show.
  - A fullscreen menu (`SiteChrome/MenuOverlay`): Research · Software · Talks & Teaching · About · Contact in big serif type.
    - Opening and closing: a clip-path wipe with staggered lines. It closes on Esc or on navigation.
    - Accessibility: it traps focus, restores focus on close, sets `aria-expanded`, and locks the scroll while open.
    - It also carries the email, socials and the active-page dot.
  - The SpotlightTerminal is now Cmd-K. Its open state is shared with the menu (`chromeStore`), so the two never stack. It locks the scroll and returns focus.
  - Retired the floating dock (FloatingBottomNav), the path pill (the terminal's collapsed island) and the old mobile hamburger (`Header/Component.client.tsx` with its runtime `<style>`, and the unused `Header/Nav`).
  - The nav metadata is centralised in `constants/navigation.ts` (`NAV_GROUPS`, with `NAVIGATION_ITEMS` derived from it).
- **Cookie card:**
  - A compact bottom-left card that springs in after 2.4 s and keeps the owner's copy.
  - Customize expands inline instead of opening a fullscreen modal.
  - It never shows on the story flight, whose copy runs along the bottom.
- **Analytics `Unexpected token '<'` fixed:**
  - Cause: Vercel Analytics and Speed Insights request `/_vercel/*/script.js`, which only exists on Vercel. Under `next start` they got the HTML 404 page.
  - Fix: `NEXT_PUBLIC_ON_VERCEL` (set in `next.config.js` from Vercel's build env) gates the tags.
- **Cleanup:**
  - Removed `@mui/material`, `@mui/icons-material`, `@emotion/*` and `next-themes` (none were imported).
  - Footer:
    - Its runtime `<style>` moved to `Footer/footer.css`.
    - The shooting-star `setTimeout` loop that never stopped is now tracked and cleared on unmount, and it pauses under reduced motion.
    - The scroll listener is passive.
    - Back-to-top uses Lenis and moved above the audio button.
    - It no longer uses the Tailwind `hidden` class, which had made it vanish instead of fading.
  - The audio button's inline hover handlers became CSS.
  - The Comments component is dark-only. It dropped a theme effect that set state and the mounted-effect pattern.
  - A skip link and a global `:focus-visible` ring were added.

## Verified (production build, MacBook)
- Typecheck, lint and 154 tests pass; the production build passes.
- **In the browser:**
  - The menu opens with focus on Close, Esc closes it and returns focus to Menu, and the scroll is locked and unlocked.
  - Cmd-K opens the terminal. A menu link navigates and the menu closes.
  - Client-side back/forward restores the exact scroll position (900 → 900).
  - `/certificates#Programming` lands on its section.
  - The top bar hides on scroll down.
  - On the story flight: no site grain, no footer, no wordmark, a single Lenis, and only the Menu/search buttons in the top-right.
  - The cookie card appears and Accept works. With consent given, no `/_vercel` request is made and no `'<'` error appears.

- **Bundle (gzip, first-load JS per route, measured from `next start`):** /cv and /contact 288.9 → 263.9 kB; home 297.0 → 272.2 kB; /my-story/preview 297.4 → 271.3 kB (about 25 kB, 8–9%, smaller on every route). This comes from:
  - The menu and the Cmd-K terminal are loaded on first open (`SiteChrome/LazyOverlays`).
  - `MaskedLines` imports GSAP only when a reveal will actually play.
  - The CSS grows from 18.3 to 20.5 kB.
- `PageHeader` is rolled out to all 14 pages that had gradient h1s (all but the home hero, which Phase 6 rebuilds).

## Not yet verified
- Phones (iPhone Safari, Android Chrome) and the Ubuntu PC/Firefox. The phone-width menu screenshot from the in-app pane came back blank (probably mid-animation), so it needs a real-device look.
- A keyboard-only pass over every page, and 200% zoom.
- Page-level content and layout refresh is Phase 6 (the home hero, cards, footer content).
