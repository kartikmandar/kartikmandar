/**
 * The CV, written out for /cv. Sourced from the owner's profile notes. Publications
 * come from data/publications.ts. Leave out grades, ranks, fees and scholarships,
 * rates, rejections and client names.
 */
export interface CvEntry {
  title: string
  organisation?: string
  place?: string
  dates?: string
  people?: string
  points?: string[]
  href?: string
}

export interface CvSection {
  id: string
  label: string
  entries: CvEntry[]
}

export const CV_RESEARCH_INTERESTS =
  '21-cm cosmology and interferometric forward modelling, black hole X-ray binaries, machine learning for strong gravitational lensing, and open-source scientific software.'

/** Sections before Publications. */
export const CV_SECTIONS_BEFORE: CvSection[] = [
  {
    id: 'education',
    label: 'Education',
    entries: [
      { title: 'MSc Physics (Astrophysics curriculum)', organisation: 'University of Catania', place: 'Italy', dates: '2026 – 2028' },
      { title: 'BS Physics', organisation: 'Indian Institute of Science Education and Research, Bhopal', place: 'India', dates: '2021 – 2025' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    entries: [
      {
        title: 'Visiting Research Student, HERA Validation Group',
        organisation: 'Raman Research Institute',
        place: 'Bengaluru, India',
        dates: 'May 2024 – present',
        people: 'Prof. Saurabh Singh, Dr. Rajorshi Chandra',
        points: [
          'Built RadioSim (formerly RRIVis), a full-polarization RIME visibility simulator with point-source and HEALPix skies, analytic and FITS beams, and NumPy, JAX and Dask backends, cross-validated against pyuvsim.',
          'Wrote the CUDA/CuPy GPU backend and matvis-like API for fftvis (co-author on the RASTI paper).',
          'Lead the hera_pspec v1.0 work (astropy units and cosmology, CLI, packaging and CI); released hera_strip on PyPI.',
          'Modelling 2D power-spectrum systematics in HERA H6C data with low-rank nuisance models, run on NRAO HPC, with Steven Murray and Adélie Gorce.',
        ],
      },
      {
        title: 'Cygnus X-1 NuSTAR group (co-lead with Kshitij Duraphe)',
        organisation: 'University of Zielona Góra',
        place: 'Remote',
        dates: 'Jan 2025 – present',
        people: 'Prof. Gopal Bhatta',
        points: [
          'Timing and reflection-spectroscopy analysis of 26 NuSTAR observations spanning 2012 to 2024, leading to one published paper and one under review.',
        ],
      },
      {
        title: 'DeepLense, Google Summer of Code 2025',
        organisation: 'ML4SCI',
        place: 'Remote',
        dates: 'Feb 2025 – present',
        people: 'Prof. Sergei Gleyzer, Dr. Michael Toomey',
        points: [
          "Built RIPPLe, a pipeline from Rubin Observatory's LSST ecosystem (Butler, TAP) to DeepLense strong-lensing models.",
          'Continuing with sim-to-real lens finding on Rubin data previews.',
        ],
      },
      {
        title: 'Stingray, Google Summer of Code 2024',
        organisation: 'Open Astronomy',
        place: 'Remote',
        dates: 'Feb 2024 – present',
        people: 'Prof. Matteo Bachetti, Dr. Guglielmo Mastroserio',
        points: [
          'Built Stingray Explorer, a desktop app for X-ray astronomy timing analysis (Electron, React, FastAPI).',
          'Modernized the legacy DAVE application: current Electron and Python, tests and security hardening.',
        ],
      },
      {
        title: 'Research Intern, Sysmatics Lab',
        organisation: 'IISER Bhopal',
        place: 'India',
        dates: 'May – Nov 2023',
        people: 'Dr. Haroon Lone',
        points: ['Built a cross-platform app logging phone sensors at 100 Hz for a mental health research study.'],
      },
    ],
  },
]

/** Sections after Publications. */
export const CV_SECTIONS_AFTER: CvSection[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    entries: [
      {
        title: 'Co-founder and technical lead',
        organisation: 'Enrolia',
        dates: '2026 – present',
        href: 'https://enrolia.app',
        points: ['Sole architect of a graduate-admissions platform: multi-agent backend, web app, voice onboarding and self-hosted inference.'],
      },
      {
        title: 'Founder',
        organisation: 'Merakinist Labs',
        dates: '2026 – present',
        href: 'https://merakinist.com',
        points: ['A forward-deployed AI engineering lab.'],
      },
      {
        title: 'Freelance AI/ML engineer',
        organisation: 'Upwork (Top Rated Plus, 100% Job Success Score)',
        points: [
          'Self-hosted LLMs and document-extraction pipelines with deterministic verification for financial documents.',
          'QLoRA fine-tuning of NVIDIA Cosmos-Reason1-7B for soccer event detection.',
          'GROMACS and LAMMPS molecular dynamics with CAD-defined boundaries.',
        ],
      },
      {
        title: 'Infrastructure',
        points: ['Earlier 5-node Slurm and Proxmox HA clusters with GPU scheduling, Kubernetes, TrueNAS and Grafana/Prometheus monitoring.'],
      },
    ],
  },
  {
    id: 'talks',
    label: 'Talks & posters',
    entries: [
      { title: 'RRIVis', organisation: 'School and Workshop on 21-cm Cosmology, TIFR Mumbai', dates: 'Mar 2026' },
      { title: 'Radio Array Systematics: HERA Case Study', organisation: 'Science at Low Frequencies XI, France (presented by Dr. Rajorshi Chandra)', dates: 'Dec 2025' },
      { title: 'RRIVis: 21cm Visibility Simulator (poster)', organisation: 'In-House Physics Symposium, IISER Bhopal', dates: 'Mar 2025' },
      { title: 'Contributing to Open Source: A Primer to GSoC and beyond', organisation: 'IISER Bhopal', dates: 'Jan 2025' },
      { title: 'Talk on Celestial Sphere Mechanics', organisation: 'IBAC, IISER Bhopal', dates: 'Apr 2023' },
    ],
  },
  {
    id: 'schools',
    label: 'Schools & meetings',
    entries: [
      { title: '44th Annual Meeting of the Astronomical Society of India', organisation: 'IIT Guwahati', dates: 'May 2026' },
      { title: 'GBT Remote Observer Training', organisation: 'Green Bank Observatory', dates: 'Nov 2025' },
      { title: 'ZTF Summer School', organisation: 'Caltech (remote)', dates: '2025' },
      { title: 'Dunlap Institute Summer School', organisation: 'University of Toronto (remote)', dates: 'Jul 2025' },
      { title: 'SKA India Training Workshop', organisation: 'IIT Indore', dates: 'Jul 2025' },
    ],
  },
  {
    id: 'awards',
    label: 'Awards',
    entries: [
      { title: 'Y Combinator Startup School India', dates: '2026' },
      { title: 'Google Summer of Code', organisation: 'ML4SCI', dates: '2025' },
      { title: 'Google Summer of Code', organisation: 'Open Astronomy', dates: '2024' },
      { title: 'iGEM Gold Medal', organisation: 'KeratiNoMore team (molecular dynamics and team wiki)', dates: '2023' },
      { title: 'Heliodyssey astronomy olympiad, All India Rank 14', organisation: 'Won a solar eclipse expedition to Oman', dates: '2019' },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    entries: [
      { title: 'Founder, Astrophysics Journal Club', organisation: 'IISER Bhopal', dates: '2024 – 2025' },
      { title: 'Captain, IISER Bhopal badminton team', organisation: 'Inter-IISER Sports Meets' },
      { title: 'Tech Head', organisation: 'All India iGEM Meet', dates: '2023' },
      { title: 'Server admin', organisation: 'IISER Bhopal Mastodon instance' },
    ],
  },
]

export const CV_SKILLS: { label: string; items: string }[] = [
  { label: 'Scientific', items: 'Python, NumPy, JAX, CuPy, Dask, astropy, HEALPix, NuSTAR and NICER data analysis' },
  { label: 'Machine learning', items: 'PyTorch, LLM fine-tuning, self-hosted inference (vLLM), RAG, Pydantic AI' },
  { label: 'Software', items: 'TypeScript, React, Next.js, FastAPI, Hono, Postgres, Expo, Swift/SwiftUI, Electron' },
  { label: 'Infrastructure', items: 'Slurm, Docker, Terraform, Ansible, Grafana/Prometheus, Cloudflare' },
  { label: 'Languages', items: 'English and Hindi (native), German (conversational), Italian (A1)' },
]

export const CV_NAV: { id: string; label: string }[] = [
  ...CV_SECTIONS_BEFORE,
  { id: 'publications', label: 'Publications' },
  ...CV_SECTIONS_AFTER,
  { id: 'skills', label: 'Skills' },
].map(({ id, label }) => ({ id, label }))
