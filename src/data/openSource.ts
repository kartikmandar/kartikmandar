/**
 * The Open Source & Projects page. Statuses were checked against GitHub on
 * 2026-11-01. Update `status` when a pull request lands.
 */
export interface ProjectLink {
  label: string
  href: string
}

export interface OpenSourceProject {
  name: string
  role: string
  /** Organisation, dates or mentors, shown under the title. */
  meta: string[]
  /** Where unmerged work stands. Say so plainly rather than implying it shipped. */
  status?: string
  summary: string
  highlights: string[]
  tags?: string[]
  image?: { src: string; alt: string }
  /** The first link is the primary action. */
  links: ProjectLink[]
}

export interface OpenSourceGroup {
  id: string
  title: string
  lead: string
  projects: OpenSourceProject[]
}

export const OPEN_SOURCE_GROUPS: OpenSourceGroup[] = [
  {
    id: 'radio',
    title: 'Radio astronomy',
    lead: 'Simulation and power-spectrum code around HERA, the 21-cm reionization array.',
    projects: [
      {
        name: 'RadioSim',
        role: 'Creator',
        meta: ['Raman Research Institute', 'Formerly RRIVis'],
        summary: 'A radio interferometer visibility simulator built on the full-polarization radio interferometer measurement equation.',
        highlights: [
          'Point-source, HEALPix and hybrid skies',
          'Analytic and FITS primary beams',
          'NumPy, JAX and Dask backends',
          'Cross-validated against pyuvsim',
        ],
        tags: ['Python', 'JAX', 'Dask'],
        image: { src: '/media/rrivis_poster.png', alt: 'Poster of the simulator under its earlier name, RRIVis' },
        links: [{ label: 'Repository', href: 'https://github.com/RRI-interferometry/RadioSim' }],
      },
      {
        name: 'hera_pspec',
        role: 'Contributor, leading v1.0',
        meta: ['HERA collaboration'],
        status: 'v1.0 in progress',
        summary: "HERA's power spectrum estimation code. I am leading the work towards its 1.0 release.",
        highlights: [
          'Native pspec CLI replacing the legacy pipeline scripts',
          'Astropy units and cosmology (PR open)',
          'Src layout, with uv and ruff in CI',
          'Example notebooks rendered in the online docs',
        ],
        tags: ['Python', 'Astropy'],
        links: [
          { label: 'Repository', href: 'https://github.com/HERA-Team/hera_pspec' },
          { label: 'My pull requests', href: 'https://github.com/HERA-Team/hera_pspec/pulls?q=is%3Apr+author%3Akartikmandar' },
        ],
      },
      {
        name: 'matvis',
        role: 'Contributor',
        meta: ['HERA collaboration'],
        status: 'PR open',
        summary: 'A fast matrix-based visibility simulator. My pull request adds full-Stokes polarized skies on CPU and GPU, keeping existing calls working.',
        highlights: [
          'Keyword-only Stokes input alongside the existing fluxes argument',
          'Same defaults and visibility ordering as before',
        ],
        tags: ['Python'],
        links: [
          { label: 'Pull request', href: 'https://github.com/HERA-Team/matvis/pull/114' },
          { label: 'Repository', href: 'https://github.com/HERA-Team/matvis' },
        ],
      },
      {
        name: 'fftvis',
        role: 'Contributor, paper co-author',
        meta: ['HERA collaboration'],
        status: 'GPU backend: PR open',
        summary: 'A NUFFT-based visibility simulator for HERA, described in the RASTI paper I co-authored. I wrote its CUDA and CuPy GPU backend.',
        highlights: [
          'Src layout and modular CPU and GPU structure (merged)',
          'Complete GPU implementation (PR open)',
        ],
        tags: ['Python', 'CUDA', 'CuPy'],
        image: { src: '/media/fftvis_visibilties.png', alt: 'Visibility plots made with fftvis' },
        links: [
          { label: 'Pull request', href: 'https://github.com/tyler-a-cox/fftvis/pull/46' },
          { label: 'Repository', href: 'https://github.com/tyler-a-cox/fftvis' },
          { label: 'Paper', href: '/publications' },
        ],
      },
      {
        name: 'hera_strip',
        role: 'Author',
        meta: ['Raman Research Institute', 'On PyPI as hera-strip'],
        summary: "An interactive view of the sky strip HERA can observe, with diffuse sky models, point-source catalogs and beam overlays.",
        highlights: [
          'GSM2008, GSM2016, LFSS and Haslam sky models',
          'HERA beam patterns from FITS, with power contours',
          'Interactive Bokeh plots in RA or LST',
        ],
        tags: ['Python', 'Bokeh'],
        links: [
          { label: 'Repository', href: 'https://github.com/RRI-interferometry/hera_strip' },
          { label: 'PyPI', href: 'https://pypi.org/project/hera-strip/' },
        ],
      },
    ],
  },
  {
    id: 'xray',
    title: 'X-ray astronomy',
    lead: 'Timing-analysis tools for the Stingray community.',
    projects: [
      {
        name: 'Stingray Explorer',
        role: 'Google Summer of Code 2024',
        meta: ['Open Astronomy', 'May - September 2024', 'Mentors: Prof. Matteo Bachetti, Dr. Guglielmo Mastroserio'],
        status: 'Desktop rebuild: PR open',
        summary: 'A quicklook dashboard for X-ray astronomy built on the Stingray library, covering light curves, power spectra, cross spectra, dynamical power spectra and spectral colors.',
        highlights: [
          'GSoC dashboard: configurable widgets, plots and layouts',
          'Bokeh and Datashader plotting, with multiprocessing support',
          'Rebuilt as a desktop app with Electron, React and FastAPI (PR open)',
          'Eleven QuickLook analysis pages working end to end in the rebuild',
        ],
        tags: ['Python', 'Electron', 'React', 'FastAPI'],
        links: [
          { label: 'Final report', href: '/open-source/stingray-explorer' },
          { label: 'Repository', href: 'https://github.com/StingraySoftware/StingrayExplorer' },
          { label: 'Desktop rebuild PR', href: 'https://github.com/StingraySoftware/StingrayExplorer/pull/2' },
          { label: 'Weekly blogs', href: 'https://gsoc2024.blogspot.com/' },
          { label: 'Proposal', href: 'https://drive.google.com/file/d/1VnP1hpKPUtQin5lKPRWXS-Ai2EW8057b/view?usp=sharing' },
        ],
      },
      {
        name: 'DAVE',
        role: 'Contributor',
        meta: ['StingraySoftware', 'March 2025 - Present'],
        status: 'PR open',
        summary: "A GUI for spectral-timing analysis of X-ray data that hadn't been updated in 8 years and no longer installed on modern computers. My pull request brings it back.",
        highlights: [
          'Current Python, Flask, Electron and plotting libraries',
          'Automated tests on Linux, macOS and Windows',
          'Security fixes and science fixes',
          'Modern UI features such as dark mode',
        ],
        tags: ['Python', 'Flask', 'Electron', 'JavaScript'],
        image: { src: '/media/DAVE.png', alt: 'The DAVE application interface' },
        links: [
          { label: 'Pull request', href: 'https://github.com/StingraySoftware/dave/pull/79' },
          { label: 'Repository', href: 'https://github.com/StingraySoftware/dave' },
        ],
      },
    ],
  },
  {
    id: 'lensing',
    title: 'Strong lensing',
    lead: 'Getting Rubin Observatory data into machine learning models.',
    projects: [
      {
        name: 'RIPPLe',
        role: 'Google Summer of Code 2025',
        meta: ['ML4SCI (DeepLense)', 'May - September 2025', 'Mentors: Prof. Sergei Gleyzer, Dr. Michael Toomey, Anna Parul, Lucca Paris'],
        summary: 'The Rubin Image Preparation and Processing Lensing engine: a pipeline from LSST data access tools to DeepLense deep learning workflows, for retrieving and preparing images and catalogs for gravitational lensing studies.',
        highlights: [
          'LSST Butler, TAP and SIA data access',
          'Configurable multi-band cutouts and normalization',
          'PyTorch DataLoader integration with DeepLense',
          'Works with both DP0.2 and DP1 data releases',
        ],
        tags: ['Python', 'PyTorch', 'LSST'],
        links: [
          { label: 'Repository', href: 'https://github.com/kartikmandar/RIPPLe' },
          { label: 'Weekly blogs', href: 'https://gsoc2025.blogspot.com/' },
          { label: 'Proposal', href: 'https://drive.google.com/file/d/1PsR4uNVVwPyAC_WN3On1DHrbXwdH3-Zh/view?usp=sharing' },
        ],
      },
    ],
  },
  {
    id: 'products',
    title: 'Products and tools',
    lead: 'What I build outside research. The two companies are not open source.',
    projects: [
      {
        name: 'Enrolia',
        role: 'Co-founder',
        meta: ['enrolia.app'],
        summary: 'The honest consultant for graduate applicants. It helps you find masters and PhD programs and keeps track of every application, with no university commissions.',
        highlights: [
          'Own the architecture and infrastructure',
          'FastAPI and Postgres API with Pydantic AI agents',
          'Next.js app and a browser autofill extension',
        ],
        tags: ['FastAPI', 'Postgres', 'Next.js'],
        links: [{ label: 'Visit Enrolia', href: 'https://enrolia.app' }],
      },
      {
        name: 'Merakinist Labs',
        role: 'Founder',
        meta: ['merakinist.com'],
        summary: 'A forward-deployed AI engineering lab that builds production AI workflows, RAG systems, data pipelines and AI product features for real business operations.',
        highlights: [],
        links: [{ label: 'Visit Merakinist', href: 'https://merakinist.com' }],
      },
      {
        name: 'PromptPrep',
        role: 'Creator and maintainer',
        meta: ['April 2025 - Present', 'On PyPI'],
        summary: 'A Python CLI that aggregates code files and directory structure into one file, for preparing LLM context.',
        highlights: [
          'Interactive TUI for visual file selection',
          'Multiple output formats (plain, markdown, HTML, highlighted)',
          'Token counting for AI model context limits',
          'Incremental processing and diff generation',
        ],
        tags: ['Python', 'Pytest'],
        links: [{ label: 'Repository', href: 'https://github.com/kartikmandar/promptprep' }],
      },
    ],
  },
]
