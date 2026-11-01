# Wow Redesign: Phase 6, Consultancy

The last route of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- The page was two links. It now has one line on who I work through, Merakinist Labs and Upwork buttons, What I build, How I work, and an email prompt.
- The metadata no longer describes Upwork-only scientific software work.

## Choices to review
- **Left out under the privacy rules:** rates, client names, the lender's sector and country, model names, and metrics from client work (97%, test counts, hours).
- **"Top Rated Plus"** comes from `PROFILE.md`, since Upwork blocks automated reads. Check that it is still current.
- **All the wording is new.** It draws on the Merakinist site and the profile's working style. "A number I can't back up doesn't get quoted" is mine.
- **Document extraction** doesn't mention finance, so it doesn't point at a client.

## Verified (production build, in-app browser)
- Typecheck, lint, 169 tests and the build pass; `/consultancy` builds as static; no console errors.
- A text scan of the page found no client names, model names, dollar signs or hourly rates.
- merakinist.com responds. No horizontal overflow at 375 wide.

## Not yet verified
- The Upwork link, which blocks automated requests.
- Real phones, the Ubuntu PC and Firefox, and a keyboard-only pass.
