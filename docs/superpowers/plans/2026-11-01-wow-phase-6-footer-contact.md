# Wow Redesign: Phase 6, Footer and Contact

The eighth step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **Server and client split:** `Footer/Component.tsx` is now a server component, so its links and text are in the HTML. Only two small parts are client code: `FooterSky` (stars and meteors) and `BackToTop`.
- **"Let's talk" end moment:** a large heading, one line and the email address open the footer on every page except the story, which hides the footer.
- **Meteors:** they now run only while the footer is on screen. They used to run on every page all the time.
- **Contact page:** rebuilt as "Get in touch", with the email first, then what to write about, where I am (University of Catania, city level) and profile links. There is still no form.
- **Footer clean-up:**
  - The copyright line now says "MSc Astrophysics" instead of "Astrophysics Student".
  - "Projects" pointed at a section that no longer exists and now goes to `/open-source`.
  - Technical skills are plain labels, because all five links went to the same place.
  - Research interests are updated: 21-cm cosmology and strong lensing are added, and "BHXBs" is spelled out.
  - An unused soft-skills list is removed.

## Choices to review
- **Personal Gmail:** it stays on the Contact page, as it was, under the main address. Removing it is a one-line change.
- **Wording:** the "Let's talk" line and the three "What to write about" descriptions are new.
- **Footer stays long on phones.** The Drive CV buttons, publications and the Reddit and X icons are kept.

## Verified (production build, in-app browser)
- Typecheck, lint, 169 tests and the build pass; `/contact` builds as static; no console errors.
- The server HTML has "Let's talk." and Catania, and no "Astrophysics Student", RRI address or old anchor.
- 150 stars render. Meteors: 0 while off screen, 3 on screen, and back to 0 after leaving.
- Back to top returns to 0 and hides itself. No horizontal overflow at 375 wide.

## Not yet verified
- Real phones, the Ubuntu PC and Firefox, and a keyboard-only pass.
- The four-column footer layout at wide desktop widths: the pane was 800 wide. The columns' classes didn't change.
- A real email client opening the mail links.

## Left alone
- The footer's publications are still written out rather than read from `data/publications.ts`.
- The Drive CV PDFs may still have old details, as noted in the CV step.
