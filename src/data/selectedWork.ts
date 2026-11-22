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
    href: '/posters',
  },
  {
    title: 'fftvis',
    summary: 'A NUFFT-based visibility simulator for HERA. I co-authored the paper and wrote its CUDA/CuPy GPU backend, now in an open pull request.',
    image: '/media/fftvis_visibilties.png',
    imageAlt: 'Visibility plots made with fftvis',
    href: 'https://github.com/tyler-a-cox/fftvis',
  },
  {
    title: 'Cygnus X-1',
    summary: 'A published timing study and a reflection-spectroscopy preprint based on 26 NuSTAR observations.',
    image: '/media/CygnusX1.png',
    imageAlt: 'Timing analysis plots of Cygnus X-1',
    href: '/publications',
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
    summary: 'An open pull request to modernize the DAVE X-ray timing app and fix scientific and security issues.',
    image: '/media/DAVE.png',
    imageAlt: 'The DAVE application interface',
    href: 'https://github.com/StingraySoftware/dave/pull/79',
  },
]
