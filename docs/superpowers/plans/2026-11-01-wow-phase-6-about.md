# Wow Redesign: Phase 6, About

The seventh step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01, with the photos still to come.**

## What changed
- **`/about`** replaces `/hobbies`, `/journal-club`, `/certificates` and `/courses`. Its data is in `data/about.ts`.
- **Old routes:** all four redirect permanently to the matching section (`redirects.js`). The menu, footer, sitemap and Cmd-K terminal now use the new page.
- **Hobbies:** running, calisthenics, cycling and treks come first. Badminton, astronomy, green tea and keyboards stay.
- **Certificates and courses:** all 25 certificates and 56 courses are kept, in folding lists. Certificates are regrouped from 13 categories to 6.

## Content changes to review
- **Badminton:** "currently playing for my college team" is now the captaincy at two Inter-IISER meets.
- **Journal club:** now in the past tense, and the "Why join?" and join-us text is gone. **The public Google Meet link is removed.**
- **"Are your visibilities Validated?"** linked to an old site path and now links to `/posters`.
- **Certificates:** the one-line descriptions are gone, as are made-up issuers such as "Version Control". Heliodyssey now says it won the Oman eclipse expedition.
- **Courses:** the "UG IISERB" pill on each course became one line above the list. No grades appear.
- **New wording to check:** "Bodyweight training, alongside the running", "Himalayan passes so far", and the page title "The rest of it".
- **Left out:** the ACL and shoulder injuries, which are health details.

## Must be done before launch
- **Photos:** treks, badminton, the Oman eclipse and Catania are empty dashed frames. Put the photos in `public/media/about`, set `src` and `alt` in `ABOUT_PHOTOS`, and re-run `scripts/generate-blur-data.mjs`.

## Verified (production build, in-app browser)
- Typecheck, lint, 169 tests and the build pass; `/about` builds as static; no console errors.
- All four old routes return 308 to the right section. The sitemap lists `/about` only.
- Section chips, the redirect and the menu's "Courses" link from another page all land on their section. Folding lists open. No horizontal overflow at 375 wide with every list open.

## Not yet verified
- Real phones, the Ubuntu PC and Firefox, and a keyboard-only pass.
- The Drive certificate links were copied unchanged and not opened.

## Left alone
- Section links land a little lower than the 96 px margin (about 150 to 185 px), so the end of the previous section shows above the heading.
- The story's journal club link still says `/journal-club` and goes through the redirect, because the narrative is covered by a snapshot.
- The footer's skills links all go to `#certificates`. The footer is the next step.
