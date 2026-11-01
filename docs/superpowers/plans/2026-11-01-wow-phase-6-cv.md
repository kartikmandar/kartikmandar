# Wow Redesign: Phase 6, CV

The fourth step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **The CV is on the page:** `data/cv.ts` holds Education, Research, Engineering, Talks & posters, Schools & meetings, Awards, Leadership and Skills. Publications come from `data/publications.ts`, so there is one source for citations. The page used to be two links to Google Drive.
- **Section rail:** a sticky list beside the CV that marks the section being read (`CV/CvRail`). Desktop only.
- **Print:** a stylesheet in `globals.css` prints it as black on white with no site chrome and a contact header. The "Print or save as PDF" button opens the browser's print dialog.
- **Drive PDFs:** both links stay, as buttons.

## Choices to review
- **Left out under the privacy rules:** grades and GPA, admission rank, school marks, stipend and grant amounts, rates, rejections, client names, references and phone number.
- **Left out for caution:**
  - The intended Catania supervisor, because research there starts in Year 2.
  - The polarized matvis work, because the owner removed it from the home list.
  - The provisional HERA systematics result.
  - Enrolia user counts, because the sources disagree.
- **SALF XI** is credited as presented by Dr. Chandra. **The ASI meeting** is under Schools & meetings as attended.
- **Poster date** is March 2025, from the Posters page. The older CV notes say March 2024, which predates the RRI work.
- **IISER dates** are 2021 to 2025, matching the story. One profile source says 2022.

## Verified (production build, in-app browser)
- Typecheck, lint, 158 tests and the build pass; `/cv` builds as static.
- Rail highlights the current section and its links land below the top bar.
- Print rules checked by applying them on screen: white page, no top bar, footer or rail, and the contact header appears.
- A text scan of the CV found none of the excluded grades, client names or money amounts.

## Not yet verified
- A real print or PDF: page breaks and margins haven't been seen.
- The Drive PDFs' contents, which may still have BS-era details or the wrong arXiv ID.
- Real phones, the Ubuntu PC and Firefox, and a keyboard-only pass.
