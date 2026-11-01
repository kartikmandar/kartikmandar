/**
 * Publications, rendered on the server. Titles, authors and identifiers come
 * from Crossref and arXiv (checked 2026-11-01).
 */
export type PublicationTopic = '21-cm' | 'X-ray binaries'

export interface PublicationAuthor {
  first: string
  last: string
}

export interface Publication {
  id: string
  title: string
  authors: PublicationAuthor[]
  year: number
  topic: PublicationTopic
  summary: string
  arxiv: string
  arxivClass: string
  /** Set once published; a paper without it is listed as under review. */
  journal?: { name: string; volume: string; page: string; doi: string }
  underReviewAt?: string
}

export const PUBLICATION_TOPICS: PublicationTopic[] = ['21-cm', 'X-ray binaries']

export const PUBLICATIONS: Publication[] = [
  {
    id: 'Duraphe2026reflection',
    title: 'A NuSTAR Reflection-Spectroscopy Survey of Cygnus X-1',
    authors: [
      { first: 'Kshitij', last: 'Duraphe' },
      { first: 'Kartik', last: 'Mandar' },
      { first: 'Chooda', last: 'Khanal' },
      { first: 'Gopal', last: 'Bhatta' },
    ],
    year: 2026,
    topic: 'X-ray binaries',
    summary: 'Reflection fits to 26 archival NuSTAR observations, showing how far the inferred disk radii and iron abundances depend on the model and the sampled mode.',
    arxiv: '2608.15902',
    arxivClass: 'astro-ph.HE',
    underReviewAt: 'The Astrophysical Journal',
  },
  {
    id: 'Duraphe2026timing',
    title: 'State-dependent X-Ray Variability in Cygnus X-1: A 12 yr NuSTAR Timing Study of Accretion Flow Geometry',
    authors: [
      { first: 'Kshitij', last: 'Duraphe' },
      { first: 'Kartik', last: 'Mandar' },
      { first: 'Chooda', last: 'Khanal' },
      { first: 'Abha', last: 'Pareek' },
      { first: 'Tejaswi', last: 'Kondhiya' },
      { first: 'V Sree', last: 'Suswara' },
      { first: 'Deeksha', last: 'Dinesh' },
      { first: 'Vidyasagar', last: 'Bhat' },
      { first: 'Gopal', last: 'Bhatta' },
    ],
    year: 2026,
    topic: 'X-ray binaries',
    summary: 'A timing analysis of 26 NuSTAR observations from 2012 to 2024, tracing how the accretion flow changes across spectral states.',
    arxiv: '2510.10746',
    arxivClass: 'astro-ph.HE',
    journal: { name: 'The Astrophysical Journal', volume: '1003', page: '13', doi: '10.3847/1538-4357/ae5632' },
  },
  {
    id: 'Cox2025fftvis',
    title: 'fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator',
    authors: [
      { first: 'Tyler A.', last: 'Cox' },
      { first: 'Steven G.', last: 'Murray' },
      { first: 'Aaron R.', last: 'Parsons' },
      { first: 'Joshua S.', last: 'Dillon' },
      { first: 'Kartik', last: 'Mandar' },
      { first: 'Zachary E.', last: 'Martinot' },
      { first: 'Robert', last: 'Pascua' },
      { first: 'Piyanat', last: 'Kittiwisit' },
      { first: 'James E.', last: 'Aguirre' },
    ],
    year: 2025,
    topic: '21-cm',
    summary: 'A visibility simulator for 21-cm experiments built on the Flatiron NUFFT library and validated against matvis.',
    arxiv: '2506.02130',
    arxivClass: 'astro-ph.IM',
    journal: { name: 'RAS Techniques and Instruments', volume: '4', page: 'rzaf056', doi: '10.1093/rasti/rzaf056' },
  },
]

/** "The Astrophysical Journal 1003, 13 (2026)", or the review status for an unpublished paper. */
export function citationLine(publication: Publication): string {
  const { journal, year, underReviewAt } = publication
  if (journal) return `${journal.name} ${journal.volume}, ${journal.page} (${year})`
  return `Under review at ${underReviewAt} (${year})`
}

export function toBibtex(publication: Publication): string {
  const { id, title, authors, year, journal, underReviewAt, arxiv, arxivClass } = publication
  const fields: [string, string][] = [
    ['author', authors.map(({ first, last }) => `${last}, ${first}`).join(' and ')],
    ['title', title],
    ...(journal
      ? ([['journal', journal.name], ['volume', journal.volume], ['pages', journal.page]] as [string, string][])
      : []),
    ['year', String(year)],
    ...(journal ? ([['doi', journal.doi]] as [string, string][]) : []),
    ['eprint', arxiv],
    ['archivePrefix', 'arXiv'],
    ['primaryClass', arxivClass],
    ...(!journal && underReviewAt ? ([['note', `Under review at ${underReviewAt}`]] as [string, string][]) : []),
  ]
  const body = fields.map(([key, value]) => `  ${key} = {${value}}`).join(',\n')
  return `@${journal ? 'article' : 'misc'}{${id},\n${body}\n}`
}
