// src/components/CosmicJourney3D/narrative.ts
// Narrative v2 — approved by the owner on 2026-10-28.
// Source of truth: docs/superpowers/specs/2026-10-28-my-story-narrative-v2-draft.md
// Acts are internal art-direction groups only; the page shows one flat sequence.

export type Act = 'spark' | 'course-correction' | 'ignition' | 'widening' | 'catania'

export interface EvidenceLink {
  label: string
  href: string
}

export interface NarrativeBeat {
  id: string
  act: Act
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
  hud: string
  evidence?: EvidenceLink
}

export const PAGE_TITLE = 'A Cosmic Journey'
export const PAGE_SUBTITLE = 'The story of a path written in the stars.'

export const NARRATIVE: readonly NarrativeBeat[] = [
  // Act I — Spark
  { id: 'nao-section', act: 'spark', eyebrow: '4th Standard', headline: 'The Spark: NAO',
    body: 'Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participate every year, fuelling a deep interest in the cosmos.',
    hud: 'c. 2012 · NEW DELHI · NAO' },
  { id: 'comet-section', act: 'spark', eyebrow: '6th – 8th Standard', headline: 'Hands-On Exploration',
    body: "Joined the SPACE-India astronomy club at school, and it was fascinating. Solar observations, making dry-ice comets, hunting for asteroids, calculating Earth's circumference and overnight observation camps at Sariska made the universe feel tangible.",
    hud: 'c. 2014–16 · SARISKA' },
  { id: 'decision-section', act: 'spark', eyebrow: '9th – 10th Standard', headline: 'A Future Decided',
    body: 'I decided my future lay among the cosmos. It seemed like a pipe dream, but I made up my mind to become an astronomer.',
    hud: 'c. 2016–18 · RESOLVE: ASTRONOMER' },
  { id: 'constellation-section', act: 'spark', eyebrow: '11th – 12th Standard', headline: 'Forging My Own Path',
    body: 'I chose PCM in high school but set my sights on research over engineering. I built my own refractor, started the "Brittle Stars" blog and played badminton competitively. I also placed AIR 14 in Heliodyssey, which won me a fully sponsored expedition to Oman to observe an annular solar eclipse.',
    hud: 'DEC 2019 · OMAN · ANNULAR ECLIPSE' },
  { id: 'search-section-wrapper', act: 'spark', eyebrow: 'Partial Drop Year', headline: 'Searching for the Right Trajectory',
    typedPhrases: ['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'],
    hud: '2020–21 · TRAJECTORY SEARCH' },

  // Act II — Course Correction
  { id: 'new-system-section', act: 'course-correction', eyebrow: '1st Year at IISER Bhopal', headline: 'A New System',
    body: 'After a partial drop year I joined the BS Economic Sciences programme at IISER Bhopal. The first semester was online because of COVID, and I used it to teach myself full-stack web development alongside my studies.',
    hud: 'OCT 2021 · BHOPAL · git init',
    evidence: { label: 'GitHub', href: 'https://github.com/kartikmandar' } },
  { id: 'fixation-section', act: 'course-correction', eyebrow: 'Temporary Home', headline: 'Fixated on Physics',
    body: 'I started as an Economic Sciences student, but my focus stayed fixed on finding a way into physics and astronomy.',
    hud: '2021–22 · ECON SCI · EYES ON PHYSICS' },
  { id: 'slingshot-section', act: 'course-correction', eyebrow: 'End of 1st Year', headline: 'Orbital Correction',
    body: 'Finishing near the top of my branch gave me the option to switch. I moved to the 5-year BS-MS Natural Sciences programme and corrected my course toward astrophysics.',
    hud: '2022 · BS-MS NATURAL SCIENCES · Δv' },
  { id: 'lens-section', act: 'course-correction', eyebrow: '2nd & 3rd Year', headline: 'Finding My Sun',
    body: 'I explored Physics, Maths and Data Science as pre-majors, then chose Physics as my major. I also joined the IISER Bhopal Astronomy Club and the Sports Council.',
    hud: '2022–24 · MAJOR: PHYSICS' },
  { id: 'internship-section', act: 'course-correction', eyebrow: 'After 2nd Year', headline: 'Dual Pathways',
    body: "I joined the Sysmatics Lab in EECS, building a mobile app that logged phone sensors at 100 Hz for a study of depression among academics. I was also on IISER Bhopal's iGEM team, running molecular dynamics simulations and building our wiki. We earned a Gold medal at the Grand Jamboree in Paris.",
    hud: '2023 · BHOPAL / PARIS · iGEM GOLD' },
  { id: 'injury-section', act: 'course-correction', eyebrow: 'Leadership & Setbacks', headline: 'Captaincy and Injury',
    body: 'I captained the IISER Bhopal badminton team at the Inter-IISER Sports Meet. Then I broke my shoulder and tore my ACL during a game, and moved from captain to coach.',
    hud: 'INTER-IISER · CAPTAIN → COACH' },

  // Act III — Ignition (2024–25)
  { id: 'rri-research-section', act: 'ignition', eyebrow: 'Summer After 3rd Year', headline: 'First Foray into Research',
    body: 'I joined the Raman Research Institute as a visiting student in the validation group of HERA, a radio array in South Africa listening for the faint 21-cm glow of early hydrogen. The Pritchard & Loeb review was my way in. After learning how matvis and other visibility simulators work, I started building my own: RRIVis.',
    hud: 'MAY 2024 · BENGALURU → KAROO · λ = 21 cm' },
  { id: 'gsoc-section', act: 'ignition', eyebrow: 'Google Summer of Code 2024', headline: 'GSoC & Open Source',
    body: 'Selected for Google Summer of Code with Stingray, I built a quicklook dashboard for X-ray time-series data. It was the start of my open-source journey.',
    hud: '2024 · OPENASTRONOMY · STINGRAY',
    evidence: { label: 'Stingray Explorer', href: 'https://github.com/StingraySoftware/StingrayExplorer' } },
  { id: 'doubling-down-section', act: 'ignition', eyebrow: 'Winter Vacation', headline: 'Doubling Down',
    body: 'With both internships done, I burned the midnight oil and went back to RRI in December to keep building RRIVis.',
    hud: 'DEC 2024 · RRI' },
  { id: 'journal-club-section', act: 'ignition', eyebrow: 'Building Community', headline: 'Starting a Journal Club',
    body: 'Back at IISER Bhopal I founded the Astrophysics Journal Club: Friday nights, one paper, whoever showed up. I opened with the cosmic dark ages, gave a primer on radio polarization, and later asked whether radio-interferometer visibilities are actually validated.',
    hud: '2025 · IISER BHOPAL · FRIDAY NIGHTS',
    evidence: { label: 'Journal club', href: '/journal-club' } },
  { id: 'bs-exit-section', act: 'ignition', eyebrow: 'A Strategic Pivot', headline: 'The BS Exit Decision',
    body: 'I took a BS exit from IISER Bhopal to pursue a Master\'s in Astrophysics elsewhere. People told me it was a hasty decision. What followed was a long stretch of juggling research with part-time work to fund the next step, and more than a few nights wondering whether they were right.',
    hud: 'MAY 2025 · BS (PHYSICS) · EXIT' },
  { id: 'lensing-section', act: 'ignition', eyebrow: 'Summer of Code 2025', headline: 'GSoC 2025: ML for Science',
    body: 'Selected again for GSoC, this time with ML4SCI, I built an LSST data pipeline for DeepLense, applying machine learning to gravitational lensing.',
    hud: '2025 · ML4SCI · RUBIN / LSST',
    evidence: { label: 'RIPPLe', href: 'https://github.com/kartikmandar/RIPPLe' } },
  { id: 'publication-section', act: 'ignition', eyebrow: 'Third RRI Stint', headline: 'First Publication & New Horizons',
    body: 'Back at RRI I worked on fftvis, a fast visibility simulator built by HERA collaborators, helping refactor it into a cleaner, modular package. It became my first co-authored paper, published in RAS Techniques & Instruments. I also joined the SKA India workshop at IIT Indore and the Dunlap summer school in Toronto, which I attended remotely.',
    hud: '2025 · RASTI 4, rzaf056',
    evidence: { label: 'arXiv:2506.02130', href: 'https://arxiv.org/abs/2506.02130' } },
  { id: 'cygnus-publication-section', act: 'ignition', eyebrow: 'Second Publication & Some Training', headline: 'Cygnus X-1 in ApJ & ZTF Summer School',
    body: 'With a student research group, I spent months on 26 NuSTAR observations of Cygnus X-1 spanning 12 years, tracking how the inner edge of its accretion disk shifts as the black hole changes state. That timing study is now published in The Astrophysical Journal. I also attended the ZTF Summer School at Caltech (remotely), learning data science for the Rubin era.',
    hud: '2026 · ApJ 1003, 13 · 5.5 → 2 Rg',
    evidence: { label: 'arXiv:2510.10746', href: 'https://arxiv.org/abs/2510.10746' } },

  // Act IV — Widening (2025–26)
  { id: 'radiosim-section', act: 'widening', eyebrow: 'The Flagship', headline: 'RRIVis Grows Up: RadioSim',
    body: 'RRIVis outgrew its name. Rebuilt as RadioSim, it models what a radio array actually records: full polarization, a composable chain of Jones terms for the distortions between sky and receiver, HEALPix skies, and analytic or measured beams, all cross-checked against pyuvsim. I presented it at the TIFR 21-cm school in Mumbai. A paper is in preparation.',
    hud: 'MAR 2026 · TIFR MUMBAI · RadioSim',
    evidence: { label: 'Talks', href: '/talks' } },
  { id: 'hera-upstream-section', act: 'widening', eyebrow: 'Inside the Collaboration', headline: 'Fixing the Tools Everyone Uses',
    body: "I started contributing upstream to HERA's own software. I opened a pull request adding full-Stokes polarized skies to matvis, and did a long run of work on hera_pspec, the power-spectrum pipeline: a new command-line interface, modern packaging, and an ongoing move to astropy units on the road to v1.0. I also released hera_strip, a small tool that shows the strip of sky HERA sees.",
    hud: '2026 · HERA-Team · hera_pspec → v1.0',
    evidence: { label: 'hera_pspec', href: 'https://github.com/HERA-Team/hera_pspec' } },
  { id: 'instruments-section', act: 'widening', eyebrow: 'Schools & Signals', headline: 'Learning the Instruments',
    body: 'I trained as a remote observer for the Green Bank Telescope and joined the Astronomical Society of India meeting at IIT Guwahati, and our RRI work on radio-array systematics was presented at Science at Low Frequencies XI in France.',
    hud: '2025–26 · GBT · ASI · SALF XI' },
  { id: 'xray-followup-section', act: 'widening', eyebrow: 'Back to Black Holes', headline: 'From Timing to Spectra',
    body: "Cygnus X-1 wasn't done with us. Our follow-up NuSTAR reflection-spectroscopy survey reads how light from the corona bounces off the disk across all 26 observations, and it is now submitted to ApJ.",
    hud: '2026 · NuSTAR × 26 · REFLECTION',
    evidence: { label: 'arXiv:2608.15902', href: 'https://arxiv.org/abs/2608.15902' } },
  { id: 'oss-maintainer-section', act: 'widening', eyebrow: 'Open Source, Long Haul', headline: 'Reviving Old Code',
    body: 'A year after GSoC I went back and rebuilt Stingray Explorer as a desktop app with Electron, React and FastAPI. I also took on DAVE, an X-ray timing GUI stuck on Python 3.5, bringing it up to Python 3.13 and a current Electron and fixing science bugs in its phaseograms and lag spectra along the way.',
    hud: '2025–26 · DAVE · Py 3.5 → 3.13',
    evidence: { label: 'DAVE', href: 'https://github.com/kartikmandar/dave' } },
  { id: 'engineer-section', act: 'widening', eyebrow: 'The Engineer', headline: "Systems That Can't Make Things Up",
    body: 'To fund the next step I started freelancing as an AI engineer. My main engagement, with an Indonesian fintech lender, taught me one rule: let the model read, and let deterministic code check. That meant a bank-statement parser whose balances reconciled on every test statement, and financial-report analysis on self-hosted models with every figure cited to its page. I now run this work as Merakinist Labs.',
    hud: '2025–26 · SELF-HOSTED · MODEL READS, CODE CHECKS',
    evidence: { label: 'Merakinist Labs', href: 'https://merakinist.com' } },
  { id: 'enrolia-section', act: 'widening', eyebrow: 'The Founder', headline: 'The Honest Consultant',
    body: 'Applying abroad, I saw how much admissions consulting runs on commissions and vague promises. So with Aryan Mishra, a fellow IISER Bhopal alum, I co-founded Enrolia: the honest consultant for graduate applicants, with no university commissions and every claim sourced. We went through YC Startup School and opened a free beta cohort in June 2026. I build the engineering side, and much of it is still being built.',
    hud: 'JUN 2026 · ENROLIA BETA',
    evidence: { label: 'Enrolia', href: 'https://beta.enrolia.app' } },
  { id: 'off-court-section', act: 'widening', eyebrow: 'Off the Court', headline: 'Run, Trek, Ship',
    body: "The injury moved me from player to coach, but never out of the sport. I even built software for running badminton tournaments, with brackets and live scores. These days I run, do calisthenics, ride, and trek high passes like Rupin and Hampta. And I'm a recovering over-planner, slowly learning to just ship.",
    hud: '2026 · RUPIN · HAMPTA · JUST SHIP',
    evidence: { label: 'On over-planning', href: '/posts/the-dilemma-of-planning-too-much' } },

  // Act V — Catania
  { id: 'admission-section', act: 'catania', eyebrow: 'April 2026', headline: 'The Door That Opened',
    body: "The \"hasty\" decision found its destination: an MSc in Physics (Astrophysics) at the University of Catania. Catania is home to Andrei Mesinger, whose group builds 21cmFAST, simulations of the very cosmic dawn I'd been modelling from the instrument side. I hope to do my thesis work there.",
    hud: 'APR 2026 · UNICT · MSc ASTROPHYSICS' },
  { id: 'arrival-section', act: 'catania', eyebrow: 'Catania, Sicily', headline: 'Landing Under Etna',
    body: "In late September 2026 I landed in Catania with beginner Italian and Etna on the horizon. Year one is coursework, from quantum physics to cosmic structure formation, and research comes next. I'm already preparing a journal-club talk here on the marked power spectrum. Same habit, new island.",
    hud: 'SEP 2026 · CATANIA · 37.5° N' },
  { id: 'analysis-section', act: 'catania', eyebrow: 'Right Now', headline: "What I'm Working On",
    body: "Alongside first-year coursework, I'm building a model of HERA's systematics, the instrument effects hiding inside the 21-cm power spectrum, with HERA collaborators on NRAO's clusters. Also on my desk: the RadioSim paper, hera_pspec v1.0, a GPU engine for fftvis, and the Cygnus X-1 spectral survey. The question underneath it all: what can we model, and what can we trust?",
    hud: 'NOW · HERA · 21 cm',
    evidence: { label: 'hera_pspec', href: 'https://github.com/HERA-Team/hera_pspec' } },
  { id: 'journey-continues-section', act: 'catania', headline: 'The Journey Continues…',
    body: '…toward the first light. Before the first stars and black holes lit up, neutral hydrogen filled the Universe, and its 21-cm glow still carries that story. Measuring it honestly, and building tools we can trust to do it, is what I want to spend the next decade on. Next: a PhD, around 2028. Still searching for signals.',
    hud: 'NEXT · EPOCH OF REIONIZATION · 150 MHz (z≈8.5) · 2028 →' },
]
