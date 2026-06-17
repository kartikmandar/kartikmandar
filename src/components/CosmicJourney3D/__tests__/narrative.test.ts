// src/components/CosmicJourney3D/__tests__/narrative.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE, HERO_PHASES, PAGE_TITLE, PAGE_SUBTITLE } from '../narrative'

// Independent transcription from src/blocks/CosmicJourney/Component.tsx (lines ~2751–3056).
// HTML entities decoded: &apos; → ', &quot; → ", &amp; → &.
// Deliberate typo "fascinaing" and double space "I  solidified" are intentional.
const EXPECTED: Array<{
  id: string
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
}> = [
  {
    id: 'nao-section',
    eyebrow: '4th Standard',
    headline: 'The Spark: NAO',
    body: 'Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos.',
  },
  {
    id: 'comet-section',
    eyebrow: '6th - 8th Standard',
    headline: 'Hands-On Exploration',
    body: "Joined SPACE-India astronomy club at school. It was fascinaing. Solar observations, making dry-ice comets, finding asteroids, calculating Earth's circumference and overnight observation camps at Sariska somehow made the universe tangible.",
  },
  {
    id: 'decision-section',
    eyebrow: '9th - 10th Standard',
    headline: 'A Future Decided',
    body: 'With a clear vision, I decided my future lay among the cosmos. It seemed like a pipe dream but I  solidified my resolve to become an astronomer.',
  },
  {
    id: 'constellation-section',
    eyebrow: '11th - 12th Standard',
    headline: 'Forging My Own Path',
    body: 'Even though I chose PCM in my high school, I went on a goal to pursue research over engineering, built my own refractor, started the "Brittle Stars" blog, and played badminton competitively. I also bagged AIR 14 in Heliodyssey, winning a fully sponsored solar expedition to Oman to study an annular eclipse.',
  },
  {
    id: 'search-section-wrapper',
    eyebrow: 'Partial Drop Year',
    headline: 'Searching for the Right Trajectory',
    typedPhrases: ['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'],
  },
  {
    id: 'new-system-section',
    eyebrow: '1st Year at IISER Bhopal',
    headline: 'A New System',
    body: 'After a partial drop year, I joined the BS Economic Sciences programme at IISER Bhopal. The first semester was online due to COVID, a time I used to focus on full-stack web development alongside my studies.',
  },
  {
    id: 'fixation-section',
    eyebrow: 'Temporary Home',
    headline: 'Fixated on Physics',
    body: 'Though I started as an Economic Sciences student, my focus was always fixed on finding a way into physics and astronomy.',
  },
  {
    id: 'slingshot-section',
    eyebrow: 'End of 1st Year',
    headline: 'Orbital Correction',
    body: 'Scoring one of the highest CGPA in my branch gave me the option to switch. I chose to migrate to the 5-year BS-MS Natural Sciences programme, correcting my course toward astrophysics.',
  },
  {
    id: 'lens-section',
    eyebrow: '2nd & 3rd Year',
    headline: 'Finding My Sun',
    body: 'Exploring Physics, Maths, and Data Science as pre-majors, I finally chose Physics as my major and joined the IISER Bhopal Astronomy Club and the Sports Council.',
  },
  {
    id: 'internship-section',
    eyebrow: 'After 2nd Year',
    headline: 'Dual Pathways',
    body: 'I got selected for an internship in Sysmatics Lab at EECS department, to develop a mobile app for collecting data for detecting signs of depression among academicians. Also got selected for the iGEM team of IISER Bhopal for the synthetic biology competition organized by MIT in Paris.',
  },
  {
    id: 'injury-section',
    eyebrow: 'Leadership & Setbacks',
    headline: 'Captaincy and Injury',
    body: 'I captained the IISER Bhopal badminton team at the Inter IISER Sports Meet. Unfortunately, I also broke my shoulder and tore my ACL during a game, leading me to transition my role from captain to a coach.',
  },
  {
    id: 'rri-research-section',
    eyebrow: 'Summer After 3rd Year',
    headline: 'First Foray into Research',
    body: 'Joined Raman Research Institute as a visiting student, working with the HERA radio array in South Africa. As a part of the validation team, I built my own visibility simulator, RRIViz.',
  },
  {
    id: 'gsoc-section',
    eyebrow: 'Google Summer of Code 2024',
    headline: 'GSoC & Open Source',
    body: 'Selected for Google Summer of Code with Stingray, I built a quicklook dashboard for X-ray time series data. This marked the start of my open-source journey.',
  },
  {
    id: 'radio-section',
    headline: 'HERA: Seeing the Invisible',
    body: 'My work at RRI involved simulating visibility data from radio interferometers like HERA. I also learned about matvis and other popular visibility simulators.',
  },
  {
    id: 'doubling-down-section',
    eyebrow: 'Winter Vacation',
    headline: 'Doubling Down',
    body: 'Successfully completing both internships, I churned the midnight oil and returned to RRI in December to continue my work on RRIViz.',
  },
  {
    id: 'bs-exit-section',
    eyebrow: 'A Strategic Pivot',
    headline: 'The BS Exit Decision',
    body: 'I decided to take a BS exit from college to pursue an MS in Astrophysics elsewhere for better opportunities.',
  },
  {
    id: 'lensing-section',
    eyebrow: 'Summer of Code 2025',
    headline: 'GSoC 2025: ML for Science',
    body: 'Selected again for GSoC with ML4SCI, working on an LSST data analysis pipeline for DeepLense and applying machine learning to gravitational lensing.',
  },
  {
    id: 'publication-section',
    eyebrow: 'Third RRI Stint',
    headline: 'First Publication & New Horizons',
    body: 'Returning to RRI, I worked on fftvis, leading to my first co-authored paper on arXiv. I was also selected for fully-sponsored summer programs at the University of Toronto and IIT Indore for SKA training.',
  },
  {
    id: 'cygnus-publication-section',
    eyebrow: 'Second Publication & Some Training',
    headline: 'Cygnus X-1 Discovery & ZTF Summer School',
    body: 'Timing analysis of Cygnus X-1 using 26 NuSTAR observations resulted in my second co-authored paper submitted to arXiv. Selected for the prestigious ZTF Summer School at Caltech, focusing on data science techniques for the Rubin Observatory era.',
  },
  {
    id: 'analysis-section',
    eyebrow: 'Current Endeavors',
    headline: 'What I am working on?',
    body: 'Currently working across different projects: spectral analysis of Cygnus X-1, RRIVis version 2 with polarization and antenna beam support, contributing to RIPPLe, DAVE and Stingray, and maintaining fftvis.',
  },
  {
    id: 'journey-continues-section',
    headline: 'The Journey Continues...',
    body: "...in search of a Master's in Astrophysics.",
  },
]

describe('narrative copy (preservation guard)', () => {
  it('has the 21 beats in order by id', () => {
    expect(NARRATIVE.map((b) => b.id)).toEqual([
      'nao-section', 'comet-section', 'decision-section', 'constellation-section',
      'search-section-wrapper', 'new-system-section', 'fixation-section', 'slingshot-section',
      'lens-section', 'internship-section', 'injury-section', 'rri-research-section',
      'gsoc-section', 'radio-section', 'doubling-down-section', 'bs-exit-section',
      'lensing-section', 'publication-section', 'cygnus-publication-section',
      'analysis-section', 'journey-continues-section',
    ])
  })

  it('preserves headline + eyebrow + body verbatim for sampled beats', () => {
    const nao = NARRATIVE[0]!
    expect(nao.eyebrow).toBe('4th Standard')
    expect(nao.headline).toBe('The Spark: NAO')
    expect(nao.body).toBe(
      'Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos.',
    )
    const comet = NARRATIVE[1]!
    expect(comet.body).toContain('It was fascinaing.') // typo preserved on purpose
    const decision = NARRATIVE[2]!
    expect(decision.body).toContain('I  solidified my resolve') // double space preserved
    const finale = NARRATIVE[20]!
    expect(finale.headline).toBe('The Journey Continues...')
    expect(finale.body).toBe("...in search of a Master's in Astrophysics.")
    expect(finale.eyebrow).toBeUndefined()
  })

  it('keeps the search beat as typed phrases with no body', () => {
    const search = NARRATIVE[4]!
    expect(search.body).toBeUndefined()
    expect(search.typedPhrases).toEqual(['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'])
  })

  it('carries the hero prologue phase copy', () => {
    expect(HERO_PHASES.map((p) => p.text)).toEqual([
      'Every story begins with a massive star.',
      'It dies in a supernova, outshining its entire galaxy.',
      'What remains collapses into a black hole. Matter spirals in, and the disk ignites.',
      'But this is just the surface of what really is happening!!',
    ])
    expect(PAGE_TITLE).toBe('A Cosmic Journey')
    expect(PAGE_SUBTITLE).toBe('The story of a path written in the stars.')
  })

  it('pins ALL 21 beats — headline, eyebrow, and body/typedPhrases — verbatim against Component.tsx', () => {
    // This is an INDEPENDENT transcription from the live source (Component.tsx).
    // A future drift in narrative.ts will fail here.
    expect(NARRATIVE).toEqual(EXPECTED)
  })
})
