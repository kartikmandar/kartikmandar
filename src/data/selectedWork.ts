/** The curated "Selected work" grid on the home page. The first entry is the feature tile. */
export interface SelectedWork {
  title: string
  summary: string
  image: string
  imageAlt: string
  href: string
}

export const SELECTED_WORK: SelectedWork[] = [
  {
    title: 'RadioSim',
    summary: 'A full-polarization RIME visibility simulator with point-source and HEALPix skies, analytic and FITS beams, and NumPy, JAX and Dask backends.',
    image: '/media/rrivis_poster.png',
    imageAlt: 'RadioSim poster showing simulated interferometer visibilities',
    href: 'https://github.com/RRI-interferometry/RadioSim',
  },
  {
    title: 'fftvis',
    summary: 'A NUFFT-based visibility simulator for HERA, with my CUDA/CuPy GPU backend.',
    image: '/media/fftvis_visibilties.png',
    imageAlt: 'Visibility plots made with fftvis',
    href: 'https://github.com/tyler-a-cox/fftvis',
  },
  {
    title: 'Cygnus X-1',
    summary: 'Timing analysis of 26 NuSTAR observations spanning 12 years.',
    image: '/media/CygnusX1.png',
    imageAlt: 'Timing analysis plots of Cygnus X-1',
    href: 'https://github.com/cygnus-x1-analysis/Analysis',
  },
  {
    title: 'RIPPLe',
    summary: "A pipeline from Rubin Observatory's LSST ecosystem to DeepLense models for strong lensing.",
    image: '/media/ML4Sci.png',
    imageAlt: 'ML4SCI DeepLense banner',
    href: 'https://github.com/kartikmandar/RIPPLe',
  },
  {
    title: 'Stingray Explorer',
    summary: 'A cross-platform desktop app for X-ray astronomy timing analysis.',
    image: '/media/stingray-explorer.png',
    imageAlt: 'Stingray Explorer logo',
    href: 'https://github.com/StingraySoftware/StingrayExplorer',
  },
  {
    title: 'DAVE',
    summary: 'A legacy X-ray timing desktop app, modernized and security hardened.',
    image: '/media/DAVE.png',
    imageAlt: 'The DAVE application interface',
    href: 'https://github.com/StingraySoftware/dave',
  },
]
