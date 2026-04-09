import type { Project } from './types'

/**
 * Static project data.
 * Generated from Payload CMS export on 2026-03-29.
 * All GitHub data (stars, forks, readme, contributors, etc.) is hardcoded inline.
 */
export const projects: Project[] = [
  {
    "id": 1,
    "displayOrder": 1,
    "title": "Fftvis",
    "shortDescription": "NUFFT-based radio interferometric visibility simulator with CUDA/CuPy GPU backend, achieving 3-10x speedups for HERA. Accepted in RASTI.",
    "description": "NUFFT-based radio interferometric visibility simulator with CUDA/CuPy GPU backend, achieving 3-10x speedups for HERA. Accepted in RASTI.",
    "category": "scientific-computing",
    "projectStatus": "active",
    "slug": "fftvis",
    "publishedAt": "2025-06-24T18:29:40.180Z",
    "updatedAt": "2025-10-16T13:42:54.308Z",
    "createdAt": "2025-06-24T18:26:59.393Z",
    "coverImage": {
      "id": 1,
      "alt": "Plots using Fftvis",
      "caption": null,
      "updatedAt": "2025-06-24T18:29:13.633Z",
      "createdAt": "2025-06-24T18:29:12.494Z",
      "url": "/media/fftvis_visibilties.png",
      "thumbnailURL": "/media/fftvis_visibilties-300x182.png",
      "filename": "fftvis_visibilties.png",
      "mimeType": "image/png",
      "filesize": 78769,
      "width": 859,
      "height": 521,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/fftvis_visibilties-300x182.png",
          "width": 300,
          "height": 182,
          "mimeType": "image/png",
          "filesize": 25861,
          "filename": "fftvis_visibilties-300x182.png"
        },
        "square": {
          "url": "/media/fftvis_visibilties-500x500.png",
          "width": 500,
          "height": 500,
          "mimeType": "image/png",
          "filesize": 66883,
          "filename": "fftvis_visibilties-500x500.png"
        },
        "small": {
          "url": "/media/fftvis_visibilties-600x364.png",
          "width": 600,
          "height": 364,
          "mimeType": "image/png",
          "filesize": 65403,
          "filename": "fftvis_visibilties-600x364.png"
        },
        "medium": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "large": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "xlarge": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "og": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        }
      }
    },
    "techStack": [
      {
        "technology": "Python"
      }
    ],
    "links": {
      "githubUrl": "https://github.com/tyler-a-cox/fftvis",
      "githubStats": {
        "stars": 7,
        "forks": 3,
        "watchers": 4,
        "openIssues": 4,
        "language": "Python",
        "size": 857,
        "lastUpdated": "2025-06-20T00:55:07.000Z"
      }
    },
    "projectDetails": {
      "linesOfCode": 5149,
      "futureWork": "GPU implementation to main branch",
      "readme": "# fftvis: A Non-Uniform Fast Fourier Transform-based Visibility Simulator\n\n![Tests](https://github.com/tyler-a-cox/fftvis/actions/workflows/ci.yml/badge.svg)\n![codecov](https://codecov.io/gh/tyler-a-cox/fftvis/branch/main/graph/badge.svg)\n![Black Formatting](https://img.shields.io/badge/code%20style-black-000000.svg)\n\n`fftvis` is a fast Python package designed for simulating interferometric visibilities using the Non-Uniform Fast Fourier Transform (NUFFT). It provides a convenient and efficient way to generate simulated visibilities.\n\n## Features\n\n- Utilizes the Flatiron Institute NUFFT (finufft) [algorithm](https://arxiv.org/abs/1808.06736) for fast visibility simulations that agree with similar methods ([`matvis`](https://github.com/HERA-team/matvis)) to high precision.\n- Designed to be a near drop-in replacement to `matvis` with a ~10x improvement in runtime\n- Extensible design that allows for easy addition of new backends\n- Support for polarized beam patterns and polarized sky models\n\n## Current Limitations\n- No support for per-antenna beams \n- GPU backend exists only as a stub implementation (coming soon!)\n- Diffuse sky models must be pixelized\n\n## Installation\n\nYou can install `fftvis` via pip:\n\n```bash\npip install fftvis\n```\n\n## Basic Usage\n\n```python\nfrom fftvis import simulate_vis\n\n# Simulate visibilities with the CPU backend (default)\nvis = simulate_vis(\n    ants=antenna_positions,\n    fluxes=source_fluxes,\n    ra=source_ra,\n    dec=source_dec,\n    freqs=frequencies,\n    times=observation_times,\n    beam=beam_model,\n    polarized=True,\n    backend=\"cpu\"  # Use \"gpu\" for GPU acceleration when implemented\n)\n```\n\n## Architecture\n\n`fftvis` is structured with a modular design:\n\n- **Core**: Contains abstract interfaces and base classes that define the API\n- **CPU**: Contains the CPU-specific implementation\n- **GPU**: Contains the GPU implementation (currently stubbed for future development)\n- **Wrapper**: Provides a high-level API for backward compatibility\n\nThis modular design makes the package more maintainable and extensible, allowing for the addition of new backends and optimizations without affecting the user API.\n\n## Contributing\nContributions to `fftvis` are welcome! If you find any issues, have feature requests, or want to contribute improvements, please open an issue or submit a pull request on the GitHub repository: `fftvis` on GitHub\n\n## License\n\nThis project is licensed under the MIT License - see the LICENSE file for details.\n\n## Acknowledgments\nThis package relies on the `finufft` implementation provided by [finufft](https://github.com/flatironinstitute/finufft) library. Special thanks to the contributors and maintainers of open-source libraries used in this project.\n",
      "readmeIsMarkdown": true,
      "totalCommits": 295,
      "fileCount": 48,
      "directoryCount": 11,
      "repositorySize": 857,
      "defaultBranch": "main",
      "isArchived": false,
      "isFork": false,
      "license": "MIT License",
      "createdAt": "2024-02-09T02:04:32.000Z",
      "homepage": "",
      "contributors": [
        {
          "name": "tyler-a-cox",
          "contributions": 222,
          "githubUrl": "https://github.com/tyler-a-cox",
          "avatarUrl": "https://avatars.githubusercontent.com/u/17678594?v=4"
        },
        {
          "name": "steven-murray",
          "contributions": 47,
          "githubUrl": "https://github.com/steven-murray",
          "avatarUrl": "https://avatars.githubusercontent.com/u/1272030?v=4"
        },
        {
          "name": "kartikmandar",
          "contributions": 19,
          "githubUrl": "https://github.com/kartikmandar",
          "avatarUrl": "https://avatars.githubusercontent.com/u/92812266?v=4"
        },
        {
          "name": "dependabot[bot]",
          "contributions": 6,
          "githubUrl": "https://github.com/apps/dependabot",
          "avatarUrl": "https://avatars.githubusercontent.com/in/29110?v=4"
        },
        {
          "name": "HERA-Observer",
          "contributions": 1,
          "githubUrl": "https://github.com/HERA-Observer",
          "avatarUrl": "https://avatars.githubusercontent.com/u/104097418?v=4"
        }
      ],
      "topics": [
        {
          "topic": "21cm-signal"
        },
        {
          "topic": "radio-astronomy"
        },
        {
          "topic": "radio-interferometry"
        },
        {
          "topic": "simulation"
        },
        {
          "topic": "telescopes"
        }
      ],
      "fileTree": [
        {
          "path": ".coveragerc",
          "type": "blob",
          "size": 245,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/cafac3fc4eb18c9a227fe07ba91f4341f47343f9"
        },
        {
          "path": ".github",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/39deff8172040e9c95c5dfae4de80a8a1be2c997"
        },
        {
          "path": ".github/dependabot.yml",
          "type": "blob",
          "size": 115,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/6fff16c79420a498f94d4ee1b7e43ae416947c0b"
        },
        {
          "path": ".github/labels.yml",
          "type": "blob",
          "size": 2777,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/6b8ebd60bbdce2eb22f2ab682bc7bf0371f78d53"
        },
        {
          "path": ".github/release-drafter.yml",
          "type": "blob",
          "size": 1850,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/d3da4ac7674f684dbe9142261871b12ec1230e5b"
        },
        {
          "path": ".github/workflows",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/94f462ba7503cbe192e274b5bcf61160e209dff4"
        },
        {
          "path": ".github/workflows/auto-merge-deps.yml",
          "type": "blob",
          "size": 277,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/53658e918171d6bfe960191cbbf645121ae10f37"
        },
        {
          "path": ".github/workflows/auto-merge-precommit.yml",
          "type": "blob",
          "size": 633,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/4ab367a890aeaf5e24f948abd290504b383f0dd8"
        },
        {
          "path": ".github/workflows/check-build.yml",
          "type": "blob",
          "size": 515,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/ecb68f197770feca904003ff2b19a4de6edbce15"
        },
        {
          "path": ".github/workflows/ci.yml",
          "type": "blob",
          "size": 1299,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/efab44eb484e5c528a39e407bab168b451c2d14f"
        },
        {
          "path": ".github/workflows/deploy.yaml",
          "type": "blob",
          "size": 641,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/af182176e0c5dc9e65d53183116bfffcb9705aed"
        },
        {
          "path": ".github/workflows/labeler.yml",
          "type": "blob",
          "size": 331,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/4071d176ea03635dee58add3383ba4a2963e33c0"
        },
        {
          "path": ".github/workflows/publish-to-pypi.yml",
          "type": "blob",
          "size": 827,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/ce6219212cd7b1969efc892cb159ec60a94e1349"
        },
        {
          "path": ".github/workflows/release-draft.yml",
          "type": "blob",
          "size": 452,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/47053b11d5b54cda4d0f439d8b57a23bf6a64698"
        },
        {
          "path": ".gitignore",
          "type": "blob",
          "size": 3245,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/ac65dc40ea153485f584a1bca6eca8391b680286"
        },
        {
          "path": "LICENSE",
          "type": "blob",
          "size": 1066,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/e20e00e42ac8f54cd20199f75c416063e4adf6dd"
        },
        {
          "path": "README.md",
          "type": "blob",
          "size": 2734,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/4c74206bb94a516242f651ade7ad94179da3bf8a"
        },
        {
          "path": "ci",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/f118b9152860c3fcdd92a21d92bfa52ca09aad90"
        },
        {
          "path": "ci/fftvis_tests.yml",
          "type": "blob",
          "size": 291,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/1b4f721b8f963b15d7c837fe678f90d59d03e3aa"
        },
        {
          "path": "codecov.yml",
          "type": "blob",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "docs",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/bb5234532f8d22d95ccf97a1ea0f23b5a1e7fb07"
        },
        {
          "path": "docs/tutorials",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/a9d3790d7df3270809ad35ae50a835f79929b4ee"
        },
        {
          "path": "docs/tutorials/fftvis_gridded_array.ipynb",
          "type": "blob",
          "size": 14876,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/b672aaab413bf134375052c8e02770630bbeaeba"
        },
        {
          "path": "docs/tutorials/fftvis_tutorial.ipynb",
          "type": "blob",
          "size": 135813,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/260559029e767109281e1fd7c1c36061a0cd5c55"
        },
        {
          "path": "pyproject.toml",
          "type": "blob",
          "size": 1485,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/81e5da5db3b7afd000bdba1338daff1adcd12e24"
        },
        {
          "path": "src",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/d303c0f67d2f2309f596e4109aee274190edc5d0"
        },
        {
          "path": "src/fftvis",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/650ae7bff981684670153a75509f386c70f8065c"
        },
        {
          "path": "src/fftvis/__init__.py",
          "type": "blob",
          "size": 691,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/20dc22bf2657ddb8967b93b7ee83122511c0b00a"
        },
        {
          "path": "src/fftvis/cli.py",
          "type": "blob",
          "size": 4090,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/9a7115dfa45a78b951256a9a9b22435f6d8d6120"
        },
        {
          "path": "src/fftvis/core",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/dbe492c411f1980cb036005967c6c53a7e8f1e6a"
        },
        {
          "path": "src/fftvis/core/__init__.py",
          "type": "blob",
          "size": 133,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/c248def5a8015ba9f47463abd1add866c93b0785"
        },
        {
          "path": "src/fftvis/core/antenna_gridding.py",
          "type": "blob",
          "size": 6973,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/14e147951e829561f9f9062ec05c713bf4120586"
        },
        {
          "path": "src/fftvis/core/beams.py",
          "type": "blob",
          "size": 4865,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/3ba3f9ccb7154cde02300b71768fd4d3580561b8"
        },
        {
          "path": "src/fftvis/core/simulate.py",
          "type": "blob",
          "size": 9802,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/69c5450ebeb01bc97af6dd059ec64103ca23cbf5"
        },
        {
          "path": "src/fftvis/core/utils.py",
          "type": "blob",
          "size": 6976,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/26519a7c828e9eca46c7078da9b9b643bfe9fe4e"
        },
        {
          "path": "src/fftvis/cpu",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/3e236a6ff50338227380dc0d41fae83aa32b3a12"
        },
        {
          "path": "src/fftvis/cpu/__init__.py",
          "type": "blob",
          "size": 193,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/f1e30e383ef12fa55fb9e3a4d607373912420f29"
        },
        {
          "path": "src/fftvis/cpu/beams.py",
          "type": "blob",
          "size": 5264,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/29c5246f2b335a535360dc5576110259dacd00e8"
        },
        {
          "path": "src/fftvis/cpu/cpu_simulate.py",
          "type": "blob",
          "size": 21435,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/ba075964e31e9430859d166beddd8a772d145ef3"
        },
        {
          "path": "src/fftvis/cpu/nufft.py",
          "type": "blob",
          "size": 4318,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/9ae2521d99abb2dec4b54145af5784178ec51649"
        },
        {
          "path": "src/fftvis/cpu/utils.py",
          "type": "blob",
          "size": 2934,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/7d0083344e2dc638996e8c9a50fe687b4aace0cd"
        },
        {
          "path": "src/fftvis/gpu",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/2d1c8e9d193c340b63c931c99a12a1d81290242f"
        },
        {
          "path": "src/fftvis/gpu/__init__.py",
          "type": "blob",
          "size": 174,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/b179673897a4aa5c8075ba20f6211018106b56ee"
        },
        {
          "path": "src/fftvis/gpu/beams.py",
          "type": "blob",
          "size": 2622,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/4d3a01e9e60c9a503ac4cf765ece23922fba06fb"
        },
        {
          "path": "src/fftvis/gpu/gpu_simulate.py",
          "type": "blob",
          "size": 2687,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/59846893098421293cd0171375abb09cdef93b87"
        },
        {
          "path": "src/fftvis/gpu/nufft.py",
          "type": "blob",
          "size": 2264,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/52c6815f2e278e496f23a6c3168f03826f474dbb"
        },
        {
          "path": "src/fftvis/gpu/utils.py",
          "type": "blob",
          "size": 1213,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/4719ccb42d9bc83d949fbeae6ba13a71f225d3f3"
        },
        {
          "path": "src/fftvis/logutils.py",
          "type": "blob",
          "size": 2554,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/c927d58cd5d30237440077ade89effdf76183ec5"
        },
        {
          "path": "src/fftvis/utils.py",
          "type": "blob",
          "size": 935,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/01efee47aabaf0505e48b0808cc34b18f1b8349a"
        },
        {
          "path": "src/fftvis/wrapper.py",
          "type": "blob",
          "size": 10737,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/cfb1e9716a5c7c529b06350424f3745c7cd696c0"
        },
        {
          "path": "tests",
          "type": "tree",
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/trees/38f1fd43f3cf932c829116a34eff74a86f995608"
        },
        {
          "path": "tests/test_antenna_gridding.py",
          "type": "blob",
          "size": 2942,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/56959d726356eb23a9d60ad562c5dbd3f4d8c1d2"
        },
        {
          "path": "tests/test_beam_evaluator.py",
          "type": "blob",
          "size": 10287,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/b950f25be20ccf1b34359053ffd737c5f0724b04"
        },
        {
          "path": "tests/test_core_utils.py",
          "type": "blob",
          "size": 7465,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/d6e0082be79ab4fc13d5f238e69fc21ae2dc5e88"
        },
        {
          "path": "tests/test_cpu_beams.py",
          "type": "blob",
          "size": 21955,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/d9fe33d51f387cf52f6fa78fe2b8c9115bc8a94a"
        },
        {
          "path": "tests/test_cpu_simulate.py",
          "type": "blob",
          "size": 33436,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/5e683252d127fd1fa067e70e2b6fc5f7e2d1858b"
        },
        {
          "path": "tests/test_gpu_beams.py",
          "type": "blob",
          "size": 1556,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/afc28d605b21c82ae06bae2365fb704ccc594ed1"
        },
        {
          "path": "tests/test_gpu_nufft.py",
          "type": "blob",
          "size": 1950,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/b2b3f1919e41677f40bb2d26e00ba029a6bdef84"
        },
        {
          "path": "tests/test_wrapper.py",
          "type": "blob",
          "size": 8336,
          "url": "https://api.github.com/repos/tyler-a-cox/fftvis/git/blobs/a0bfd84e6f075ec5e3de9c8a93213f34e26b7669"
        }
      ],
      "githubIssues": {
        "total": 5,
        "open": 3,
        "closed": 1
      },
      "githubPullRequests": {
        "total": 11,
        "open": 1,
        "closed": 0,
        "merged": 10
      }
    },
    "publication": {
      "title": "fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator",
      "authors": "Tyler A. Cox, Steven G. Murray, Aaron R. Parsons, Joshua S. Dillon, Kartik Mandar, Zachary E. Martinot, Robert Pascua, Piyanat Kittiwisit, James E. Aguirre",
      "venue": "RASTI",
      "year": 2025,
      "url": "https://arxiv.org/abs/2506.02130"
    },
    "branches": [
      {
        "name": "beam-interface-update",
        "commitSha": "677e107859523b645d57d274d98f1a406719ad71"
      },
      {
        "name": "change_flat_array_tol",
        "commitSha": "567803d187366bb148babc3a5cec40224190783c"
      },
      {
        "name": "faster_beam_interpolation",
        "commitSha": "f8a2ac042da385c0f21d5477e898a1c67820576c"
      },
      {
        "name": "gpu",
        "commitSha": "9309a60814f4f86035e8768032829b21137688d3"
      },
      {
        "name": "infrastructure",
        "commitSha": "161ed26b88d916335e0785d76ada32ec0ca0966d"
      },
      {
        "name": "main",
        "commitSha": "0c225797de8d2aedb0ca8e8b6400dc438e61a00e"
      },
      {
        "name": "mp_fftvis",
        "commitSha": "9ce843ace71547310b470f35241f00c583e3ec4e"
      },
      {
        "name": "multi_beam_sims",
        "commitSha": "f7770defdbad36c40e5a5b9cf7da8899b78a4324"
      },
      {
        "name": "polarized_sky_model",
        "commitSha": "c2ec1277ac8dce357662cbbf178ca2f6a4017581"
      },
      {
        "name": "polarized_sky_new_struc",
        "commitSha": "a68df0664ba8289ce485ff8d222da35bc93057f8"
      },
      {
        "name": "prepare_for_gpu",
        "commitSha": "0d6e68ed471d095aaf04bab7aeeb817be4037359"
      },
      {
        "name": "revert-37-infrastructure",
        "commitSha": "961e144ffe77cdaa50b3e2d95837902bd1eb1579"
      },
      {
        "name": "scalable_beam_interp",
        "commitSha": "b9f4095b6a38be024a7661358511df1045794e2d"
      }
    ],
    "lastGitHubSync": "2025-09-09T06:12:03.486Z",
    "meta": {
      "title": "FFTVis | Non Uniform Fast Fourier Transform Based Interferometric Visibility Simulator",
      "description": "Python package for simulating interferometric visibilities using the Flatiron Institute Non-Uniform Fast Fourier Transform (finufft)",
      "image": {
        "id": 1,
        "alt": "Plots using Fftvis",
        "caption": null,
        "updatedAt": "2025-06-24T18:29:13.633Z",
        "createdAt": "2025-06-24T18:29:12.494Z",
        "url": "/media/fftvis_visibilties.png",
        "thumbnailURL": "/media/fftvis_visibilties-300x182.png",
        "filename": "fftvis_visibilties.png",
        "mimeType": "image/png",
        "filesize": 78769,
        "width": 859,
        "height": 521,
        "focalX": 50,
        "focalY": 50,
        "sizes": {
          "thumbnail": {
            "url": "/media/fftvis_visibilties-300x182.png",
            "width": 300,
            "height": 182,
            "mimeType": "image/png",
            "filesize": 25861,
            "filename": "fftvis_visibilties-300x182.png"
          },
          "square": {
            "url": "/media/fftvis_visibilties-500x500.png",
            "width": 500,
            "height": 500,
            "mimeType": "image/png",
            "filesize": 66883,
            "filename": "fftvis_visibilties-500x500.png"
          },
          "small": {
            "url": "/media/fftvis_visibilties-600x364.png",
            "width": 600,
            "height": 364,
            "mimeType": "image/png",
            "filesize": 65403,
            "filename": "fftvis_visibilties-600x364.png"
          },
          "medium": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "large": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "xlarge": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "og": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          }
        }
      }
    }
  },
  {
    "id": 4,
    "displayOrder": 3,
    "title": "RIPPLe",
    "shortDescription": "Data pipeline connecting Rubin Observatory's LSST ecosystem to DeepLense ML workflows, with multi-backend data access (Butler, TAP, SIAv2) and two-tier caching. GSoC 2025.",
    "description": "Data pipeline connecting Rubin Observatory's LSST ecosystem to DeepLense ML workflows, with multi-backend data access (Butler, TAP, SIAv2) and two-tier caching. GSoC 2025.",
    "category": "scientific-computing",
    "projectStatus": "active",
    "slug": "ripple",
    "publishedAt": "2025-07-06T17:45:53.893Z",
    "updatedAt": "2025-09-09T06:12:01.691Z",
    "createdAt": "2025-07-06T17:45:19.022Z",
    "coverImage": {
      "id": 6,
      "alt": "Machine Learning for Science",
      "caption": null,
      "updatedAt": "2025-07-14T06:03:39.279Z",
      "createdAt": "2025-07-14T06:03:36.996Z",
      "url": "/media/ML4Sci.png",
      "thumbnailURL": "/media/ML4Sci-300x115.png",
      "filename": "ML4Sci.png",
      "mimeType": "image/png",
      "filesize": 2175063,
      "width": 1816,
      "height": 698,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/ML4Sci-300x115.png",
          "width": 300,
          "height": 115,
          "mimeType": "image/png",
          "filesize": 75070,
          "filename": "ML4Sci-300x115.png"
        },
        "square": {
          "url": "/media/ML4Sci-500x500.png",
          "width": 500,
          "height": 500,
          "mimeType": "image/png",
          "filesize": 603425,
          "filename": "ML4Sci-500x500.png"
        },
        "small": {
          "url": "/media/ML4Sci-600x231.png",
          "width": 600,
          "height": 231,
          "mimeType": "image/png",
          "filesize": 281399,
          "filename": "ML4Sci-600x231.png"
        },
        "medium": {
          "url": "/media/ML4Sci-900x346.png",
          "width": 900,
          "height": 346,
          "mimeType": "image/png",
          "filesize": 616287,
          "filename": "ML4Sci-900x346.png"
        },
        "large": {
          "url": "/media/ML4Sci-1400x538.png",
          "width": 1400,
          "height": 538,
          "mimeType": "image/png",
          "filesize": 1459137,
          "filename": "ML4Sci-1400x538.png"
        },
        "xlarge": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "og": {
          "url": "/media/ML4Sci-1200x630.png",
          "width": 1200,
          "height": 630,
          "mimeType": "image/png",
          "filesize": 1566620,
          "filename": "ML4Sci-1200x630.png"
        }
      }
    },
    "links": {
      "githubUrl": "https://github.com/kartikmandar/RIPPLe",
      "githubStats": {
        "stars": 0,
        "forks": 2,
        "watchers": 0,
        "openIssues": 0,
        "language": null,
        "size": 0,
        "lastUpdated": "2025-05-28T14:30:36.000Z"
      }
    },
    "projectDetails": {
      "linesOfCode": 0,
      "futureWork": "Ongoing",
      "readme": "RIPPLe (Rubin Image Preparation and Processing Lensing engine)\n\n",
      "readmeIsMarkdown": true,
      "totalCommits": 1,
      "fileCount": 1,
      "directoryCount": 0,
      "repositorySize": 0,
      "defaultBranch": "main",
      "isArchived": false,
      "isFork": false,
      "createdAt": "2025-05-28T14:23:31.000Z",
      "contributors": [
        {
          "name": "kartikmandar",
          "contributions": 1,
          "githubUrl": "https://github.com/kartikmandar",
          "avatarUrl": "https://avatars.githubusercontent.com/u/92812266?v=4"
        }
      ],
      "fileTree": [
        {
          "path": "README.md",
          "type": "blob",
          "size": 64,
          "url": "https://api.github.com/repos/kartikmandar/RIPPLe/git/blobs/3ebd7f623e5d7d6c44242544a92ef073f6a0e7bf"
        }
      ],
      "githubIssues": {
        "total": 0,
        "open": 0,
        "closed": 0
      },
      "githubPullRequests": {
        "total": 0,
        "open": 0,
        "closed": 0,
        "merged": 0
      }
    },
    "branches": [
      {
        "name": "main",
        "commitSha": "ea141352e0e3f2b9eecec27ad318d95cb38575c1"
      }
    ],
    "lastGitHubSync": "2025-09-09T06:12:01.554Z",
    "meta": {
      "title": "RIPPLe",
      "description": "Rubin Image Preparation and Processing Lensing engine",
      "image": {
        "id": 6,
        "alt": "Machine Learning for Science",
        "caption": null,
        "updatedAt": "2025-07-14T06:03:39.279Z",
        "createdAt": "2025-07-14T06:03:36.996Z",
        "url": "/media/ML4Sci.png",
        "thumbnailURL": "/media/ML4Sci-300x115.png",
        "filename": "ML4Sci.png",
        "mimeType": "image/png",
        "filesize": 2175063,
        "width": 1816,
        "height": 698,
        "focalX": 50,
        "focalY": 50,
        "sizes": {
          "thumbnail": {
            "url": "/media/ML4Sci-300x115.png",
            "width": 300,
            "height": 115,
            "mimeType": "image/png",
            "filesize": 75070,
            "filename": "ML4Sci-300x115.png"
          },
          "square": {
            "url": "/media/ML4Sci-500x500.png",
            "width": 500,
            "height": 500,
            "mimeType": "image/png",
            "filesize": 603425,
            "filename": "ML4Sci-500x500.png"
          },
          "small": {
            "url": "/media/ML4Sci-600x231.png",
            "width": 600,
            "height": 231,
            "mimeType": "image/png",
            "filesize": 281399,
            "filename": "ML4Sci-600x231.png"
          },
          "medium": {
            "url": "/media/ML4Sci-900x346.png",
            "width": 900,
            "height": 346,
            "mimeType": "image/png",
            "filesize": 616287,
            "filename": "ML4Sci-900x346.png"
          },
          "large": {
            "url": "/media/ML4Sci-1400x538.png",
            "width": 1400,
            "height": 538,
            "mimeType": "image/png",
            "filesize": 1459137,
            "filename": "ML4Sci-1400x538.png"
          },
          "xlarge": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "og": {
            "url": "/media/ML4Sci-1200x630.png",
            "width": 1200,
            "height": 630,
            "mimeType": "image/png",
            "filesize": 1566620,
            "filename": "ML4Sci-1200x630.png"
          }
        }
      }
    }
  },
  {
    "id": 9,
    "displayOrder": 4,
    "title": "CygX1 X-ray Analysis",
    "shortDescription": "Timing and spectral analysis of Cygnus X-1 using 26 NuSTAR observations spanning 12 years. Accepted in The Astrophysical Journal.",
    "description": "A comprehensive multi-mission X-ray timing and spectral analysis project studying the black hole binary Cygnus X-1.",
    "category": "research",
    "projectStatus": "active",
    "slug": "cygx1-x-ray-analysis",
    "publishedAt": "2025-07-14T06:11:50.143Z",
    "updatedAt": "2025-10-16T11:44:45.911Z",
    "createdAt": "2025-07-14T06:07:30.657Z",
    "coverImage": {
      "id": 7,
      "alt": "Hard vs Soft Flux for Cygnus X1",
      "caption": null,
      "updatedAt": "2025-07-14T06:10:18.323Z",
      "createdAt": "2025-07-14T06:10:17.056Z",
      "url": "/media/CygnusX1.png",
      "thumbnailURL": "/media/CygnusX1-300x192.png",
      "filename": "CygnusX1.png",
      "mimeType": "image/png",
      "filesize": 521968,
      "width": 1176,
      "height": 754,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/CygnusX1-300x192.png",
          "width": 300,
          "height": 192,
          "mimeType": "image/png",
          "filesize": 46065,
          "filename": "CygnusX1-300x192.png"
        },
        "square": {
          "url": "/media/CygnusX1-500x500.png",
          "width": 500,
          "height": 500,
          "mimeType": "image/png",
          "filesize": 191309,
          "filename": "CygnusX1-500x500.png"
        },
        "small": {
          "url": "/media/CygnusX1-600x385.png",
          "width": 600,
          "height": 385,
          "mimeType": "image/png",
          "filesize": 156151,
          "filename": "CygnusX1-600x385.png"
        },
        "medium": {
          "url": "/media/CygnusX1-900x577.png",
          "width": 900,
          "height": 577,
          "mimeType": "image/png",
          "filesize": 322399,
          "filename": "CygnusX1-900x577.png"
        },
        "large": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "xlarge": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "og": {
          "url": "/media/CygnusX1-1200x630.png",
          "width": 1200,
          "height": 630,
          "mimeType": "image/png",
          "filesize": 500196,
          "filename": "CygnusX1-1200x630.png"
        }
      }
    },
    "techStack": [
      {
        "technology": "Python"
      },
      {
        "technology": "Shell"
      }
    ],
    "links": {
      "githubUrl": "https://github.com/cygnus-x1-analysis/Analysis",
      "githubStats": {
        "stars": 0,
        "forks": 0,
        "watchers": 0,
        "openIssues": 0,
        "language": "Python",
        "size": 182,
        "lastUpdated": "2025-07-14T06:06:37.000Z"
      }
    },
    "projectDetails": {
      "linesOfCode": 13924,
      "futureWork": "Ongoing",
      "readme": "# CygX1 Multi-Mission X-ray Timing Analysis\n\nA comprehensive multi-mission X-ray timing and spectral analysis project studying the black hole binary Cygnus X-1.\n\n## Data Access\n\nAll project data is available at:\nhttps://drive.google.com/drive/folders/1WnlOXwfbNVlffGupCfgIknap2vWm5WUd?usp=sharing\n\n## Project Overview\n\nThis project involves detailed timing analysis using data from four major X-ray missions:\n- **RXTE/PCA** - Historical archive (1996-2011)\n- **NuSTAR/FPM** - Hard X-ray focusing (3-79 keV)\n- **XMM-Newton/EPIC** - High throughput, soft X-ray spectral resolution\n- **NICER/XTI** - Ultra-precise timing (<1¼s)\n\n## Environment Setup\n\nRequires:\n- **HEASoft 6.35** with complete CALDB\n- **XMM-Newton SAS 22.1.0**\n- **Python 3.12.9** with Stingray 2.2.6\n- **Conda environment:** `xray-env`\n\n## Quick Start\n\n```bash\n# Initialize environment\nheainit && caldbinit && sasinit\n\n# Activate conda environment\nconda activate xray-env\n\n# Run analysis pipeline\npython scripts/analysis/test_stingray_setup.py\n```\n\n## Project Status\n\nPhase 1: ~85% Complete\n- \u0005 Complete infrastructure setup\n- \u0005 Literature analysis (51 papers)\n- \u0005 Multi-mission data acquisition (448 observations)\n- \u0005 Barycentric correction pipeline (100 timing-ready files)\n- \u0005 State classification framework\n- \u0005 Orbital phase analysis\n\n## Scientific Objectives\n\n- Systematic comparison of hard and soft accretion states\n- Broadband timing and spectral correlation analysis\n- Multi-mission cross-calibration studies\n- Constraints on black hole parameters and accretion physics",
      "readmeIsMarkdown": true,
      "totalCommits": 3,
      "fileCount": 62,
      "directoryCount": 5,
      "repositorySize": 182,
      "defaultBranch": "main",
      "isArchived": false,
      "isFork": false,
      "createdAt": "2025-07-14T06:00:38.000Z",
      "contributors": [
        {
          "name": "kartikmandar",
          "contributions": 3,
          "githubUrl": "https://github.com/kartikmandar",
          "avatarUrl": "https://avatars.githubusercontent.com/u/92812266?v=4"
        }
      ],
      "fileTree": [
        {
          "path": ".gitignore",
          "type": "blob",
          "size": 995,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/6dfff30736fec8c15c05a0d01420af84e764809e"
        },
        {
          "path": "README.MD",
          "type": "blob",
          "size": 1543,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/624bed4439eb52f16a2c683157590b2cb188f298"
        },
        {
          "path": "config",
          "type": "tree",
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/trees/f7fb44c8ab16a5f8bf920680d53d460391c7c9a1"
        },
        {
          "path": "config/analysis_settings.py",
          "type": "blob",
          "size": 1598,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/4bdb079547bba7019e45a096a5ad4c9b0cd8f8d4"
        },
        {
          "path": "config/cygx1_orbital_ephemeris.py",
          "type": "blob",
          "size": 5025,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/1f0ab68b64863db2eebc8a3add48022538f5355a"
        },
        {
          "path": "config/database_schema.sql",
          "type": "blob",
          "size": 1763,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/5051cea20c095fb6b299f007bb541c2dab9a7652"
        },
        {
          "path": "scripts",
          "type": "tree",
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/trees/a6088abcbe51e506a1a6d0c8f2e05fbc4705a485"
        },
        {
          "path": "scripts/analysis",
          "type": "tree",
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/trees/3020a83e7682ca38f7427b5a5f75bb2823036e4c"
        },
        {
          "path": "scripts/analysis/check_original_vs_bary.py",
          "type": "blob",
          "size": 2599,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/62c7990f17728f3b9adce35b6ee3b6846937242e"
        },
        {
          "path": "scripts/analysis/combine_energy_resolved_lightcurves.py",
          "type": "blob",
          "size": 10592,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/0420e95e185970de80b14878387e2ecc90a6a721"
        },
        {
          "path": "scripts/analysis/create_energy_resolved_lightcurves.py",
          "type": "blob",
          "size": 12079,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/913ca99e0521ffb774560fa8678ca364d2f4089f"
        },
        {
          "path": "scripts/analysis/create_energy_resolved_lightcurves_optimized.py",
          "type": "blob",
          "size": 12886,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/ad9bb1936ec99c8acb15c909b1f77b35cb0ffc82"
        },
        {
          "path": "scripts/analysis/create_hid_diagrams.py",
          "type": "blob",
          "size": 12037,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/b3cc2280b6c6644853900cfa5884dd69625da948"
        },
        {
          "path": "scripts/analysis/create_hid_plots.py",
          "type": "blob",
          "size": 16383,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/10901daa0666796dd6d16ac2fd0c01c6cd8162da"
        },
        {
          "path": "scripts/analysis/create_nicer_combined_lightcurve.py",
          "type": "blob",
          "size": 8200,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/087914ecfe77f3026b13ef32df24dfa6668ebc8f"
        },
        {
          "path": "scripts/analysis/create_nicer_combined_lightcurve_nogaps.py",
          "type": "blob",
          "size": 11375,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/7c1162c35319c78c1210e7ac01d5cca501b531fa"
        },
        {
          "path": "scripts/analysis/create_nicer_energy_hid.py",
          "type": "blob",
          "size": 19039,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/455f958ec9f04c16a2c0a24d5e47fba0e9515c5b"
        },
        {
          "path": "scripts/analysis/create_nicer_flux_scatter.py",
          "type": "blob",
          "size": 9760,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/c92950de627d6f066552e53d55271e9d8c4f3c06"
        },
        {
          "path": "scripts/analysis/create_nicer_flux_scatter_improved.py",
          "type": "blob",
          "size": 12323,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/3c6936a733b0ec07e6a536637ead851340a19f64"
        },
        {
          "path": "scripts/analysis/create_nicer_hid_multiband.py",
          "type": "blob",
          "size": 19949,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/15ba9d868c1c8d8e74eae6a76ddf354807c585a9"
        },
        {
          "path": "scripts/analysis/create_nicer_hid_simple.py",
          "type": "blob",
          "size": 13102,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/6731178610fad16515114f5df4b727083e69d3d0"
        },
        {
          "path": "scripts/analysis/create_nustar_combined_lightcurve.py",
          "type": "blob",
          "size": 10930,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/5983ad1f426211a8cf32bc5483d3402f1b710ad7"
        },
        {
          "path": "scripts/analysis/create_nustar_combined_lightcurve_nogaps.py",
          "type": "blob",
          "size": 13933,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/937b55cad7a721e793882d2c19b0e8467528e6a5"
        },
        {
          "path": "scripts/analysis/create_nustar_flux_scatter_comprehensive.py",
          "type": "blob",
          "size": 17409,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/35f7bf1eedb8d20c5bbbbf04c32c0210158db401"
        },
        {
          "path": "scripts/analysis/create_observation_summaries.py",
          "type": "blob",
          "size": 10314,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/8430669272a6e09c7f62914bd73965d006cee2bf"
        },
        {
          "path": "scripts/analysis/create_observation_summaries_enhanced.py",
          "type": "blob",
          "size": 18752,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/59590ab1a9ec134d4305d8682915f441d0ff94fb"
        },
        {
          "path": "scripts/analysis/debug_gti_issue.py",
          "type": "blob",
          "size": 4481,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/c0606077f987773e356de0fe20def31f2f886bf5"
        },
        {
          "path": "scripts/analysis/example_nicer_combined_usage.py",
          "type": "blob",
          "size": 1549,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/cbc4ba3f067d0a8fc0243064370a0320681a427a"
        },
        {
          "path": "scripts/analysis/literature_validation.py",
          "type": "blob",
          "size": 20164,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/f9f45386127c52f70927c4def154a0380c90e7d1"
        },
        {
          "path": "scripts/analysis/monitor_data_ingester.py",
          "type": "blob",
          "size": 10967,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/5489e18ae407dd622750f7241e77ef5ed3d9fe1f"
        },
        {
          "path": "scripts/analysis/monitor_data_processor.py",
          "type": "blob",
          "size": 21564,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/bd650178740d84b9468918e6aa93b5cca33c909d"
        },
        {
          "path": "scripts/analysis/nicer_events_to_lightcurves.py",
          "type": "blob",
          "size": 47824,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/897ee534638b6d486755a1ac98c4299ee67fb0fe"
        },
        {
          "path": "scripts/analysis/nustar_events_to_lightcurves.py",
          "type": "blob",
          "size": 57182,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/4a5b8d3e4e845b8af575cf0b5378c2dc533aeb67"
        },
        {
          "path": "scripts/analysis/run_memory_tests.py",
          "type": "blob",
          "size": 7899,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/8a7092579bb5dc59c86912fda80cda550686a57b"
        },
        {
          "path": "scripts/analysis/setup_memory_profiling.py",
          "type": "blob",
          "size": 3120,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/e22b0c2e8995ea745defa28f8515a7fd533e08cc"
        },
        {
          "path": "scripts/analysis/state_period_analyzer.py",
          "type": "blob",
          "size": 14316,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/9ce8d965365b835315cf3a8ce9844a15dd0d3291"
        },
        {
          "path": "scripts/analysis/stingray_memory_mwe.py",
          "type": "blob",
          "size": 9235,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/dab24b8660713ce87a84f72a82122190773ac8da"
        },
        {
          "path": "scripts/analysis/test_energy_subprocess.py",
          "type": "blob",
          "size": 1141,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/3ccb3b76ce66d880572dd68755c9a5206276498d"
        },
        {
          "path": "scripts/analysis/test_nustar_scatter.sh",
          "type": "blob",
          "size": 1050,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/60c475323d33de41cdaac23498f765a9327358cc"
        },
        {
          "path": "scripts/analysis/test_pi_energy_conversion.py",
          "type": "blob",
          "size": 3393,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/54d368fde7a9499365c2571de30fd3bcfed1d0f5"
        },
        {
          "path": "scripts/analysis/test_processed_data.py",
          "type": "blob",
          "size": 4668,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/d8de8cef3a1e8e9faedf2545cbdf2f2972786280"
        },
        {
          "path": "scripts/analysis/test_stingray_setup.py",
          "type": "blob",
          "size": 6984,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/74a7f3d7d4d9854291b2998edc5dea94df6df7bf"
        },
        {
          "path": "scripts/analysis/update_lightcurve_plots_mjd.py",
          "type": "blob",
          "size": 15270,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/7dcbd03da22b29287e684dbf8ba9cd482f8d54bb"
        },
        {
          "path": "scripts/analysis/validate_lightcurves.py",
          "type": "blob",
          "size": 5784,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/3f5882d1026a6233cea43ec82ff67034490dd1f0"
        },
        {
          "path": "scripts/analyze_nustar_data_completeness.py",
          "type": "blob",
          "size": 11861,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/a8f18055c5ed92ee25b67f5299823cbb75d3cf82"
        },
        {
          "path": "scripts/barycorr_nicer_example.sh",
          "type": "blob",
          "size": 976,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/f3044db51885089474ed479b6312ee662b68db2d"
        },
        {
          "path": "scripts/barycorr_nustar_example.sh",
          "type": "blob",
          "size": 1460,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/3b9a0750b6c34bbcb34c990121e28a0d07ca583c"
        },
        {
          "path": "scripts/batch_barycorr_all_missions.sh",
          "type": "blob",
          "size": 5656,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/cc5ea03e39c928bc26fc7c152a971c3937ab8452"
        },
        {
          "path": "scripts/extract_observation_dates.py",
          "type": "blob",
          "size": 6100,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/fb34797855c44834920cc72f82b82ad9e62752ec"
        },
        {
          "path": "scripts/modify_rxte_script.py",
          "type": "blob",
          "size": 3822,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/e34434bf266d9b0cc9336a8a69e89ea2bb6e1491"
        },
        {
          "path": "scripts/spectral_analysis",
          "type": "tree",
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/trees/1c31bba73ae7e45cc4a5ac28566837633af701e6"
        },
        {
          "path": "scripts/spectral_analysis/__init__.py",
          "type": "blob",
          "size": 569,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/3a76a28a797ae41809d496d9d35932f313902b9a"
        },
        {
          "path": "scripts/spectral_analysis/combined.py",
          "type": "blob",
          "size": 32802,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/6ca8674506f9080c5921c366ca2a40c6b779e1cf"
        },
        {
          "path": "scripts/spectral_analysis/core.py",
          "type": "blob",
          "size": 22077,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/219097ce860b55c660a6a00a9a8ae9f3f70cd329"
        },
        {
          "path": "scripts/spectral_analysis/nicer.py",
          "type": "blob",
          "size": 23507,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/0021dfd3c01e89f10a2747ca4b0240ad240c2ec7"
        },
        {
          "path": "scripts/spectral_analysis/nustar.py",
          "type": "blob",
          "size": 34695,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/bcf6112d94147f1cfe3eb1578525131040f61434"
        },
        {
          "path": "scripts/spectral_analysis/run_spectral_analysis.py",
          "type": "blob",
          "size": 9510,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/6a51066640545ad026a98ccb0a2dc0d1b2d1eed5"
        },
        {
          "path": "scripts/update_database_observation_dates.py",
          "type": "blob",
          "size": 6069,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/5d13eae4a04066cfeac12b55d1a77cd62bafef17"
        },
        {
          "path": "scripts/utils",
          "type": "tree",
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/trees/b44932fb3ffeaf54401bc5a544cf7b5beb6d492c"
        },
        {
          "path": "scripts/utils/add_orbital_phases.py",
          "type": "blob",
          "size": 16188,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/849178b56cf4b8772e60ffcdf7230262b8ff2855"
        },
        {
          "path": "scripts/utils/backup_manager.py",
          "type": "blob",
          "size": 26444,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/4467ce56a9b1ba88b59593c6f36c44169927429b"
        },
        {
          "path": "scripts/utils/database_manager.py",
          "type": "blob",
          "size": 22425,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/05af77a35a86440fc591187edcfa807b3bfaad26"
        },
        {
          "path": "scripts/utils/identify_superior_conjunctions.py",
          "type": "blob",
          "size": 17218,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/20a893440e2a4296266f1eaeb27743ecbaf3c7d5"
        },
        {
          "path": "scripts/utils/integrity_monitor.py",
          "type": "blob",
          "size": 22677,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/eeff8b2027791c5901cbd005b9cd7af9ba55d3cd"
        },
        {
          "path": "scripts/utils/orbital_phase_calculator.py",
          "type": "blob",
          "size": 13689,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/dd43dd9d7b10f697f9eddee1393c2f86c3a8dee7"
        },
        {
          "path": "scripts/utils/setup_backup_schedule.sh",
          "type": "blob",
          "size": 3442,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/46656997ae82559702a488dfc5427a5417ab2b36"
        },
        {
          "path": "scripts/utils/validate_orbital_phases.py",
          "type": "blob",
          "size": 16119,
          "url": "https://api.github.com/repos/cygnus-x1-analysis/Analysis/git/blobs/2c6e01b8457dc4381feab8b2b78b64ec6953eb54"
        }
      ],
      "githubIssues": {
        "total": 0,
        "open": 0,
        "closed": 0
      },
      "githubPullRequests": {
        "total": 0,
        "open": 0,
        "closed": 0,
        "merged": 0
      }
    },
    "publication": {
      "title": "State-Dependent X-ray Variability in Cygnus X-1: A 12-Year NuSTAR Timing Study of Accretion Flow Geometry",
      "authors": "",
      "venue": "",
      "year": 2026,
      "url": "https://arxiv.org/abs/2510.10746"
    },
    "branches": [
      {
        "name": "main",
        "commitSha": "b195a69c94744842c0938dc427013dc8b1111614"
      }
    ],
    "lastGitHubSync": "2025-09-09T06:12:08.750Z",
    "meta": {
      "title": "Cygnus X1 Multi-Mission X-ray Analysis",
      "description": "A comprehensive multi-mission X-ray timing and spectral analysis project studying the black hole binary Cygnus X-1.",
      "image": {
        "id": 7,
        "alt": "Hard vs Soft Flux for Cygnus X1",
        "caption": null,
        "updatedAt": "2025-07-14T06:10:18.323Z",
        "createdAt": "2025-07-14T06:10:17.056Z",
        "url": "/media/CygnusX1.png",
        "thumbnailURL": "/media/CygnusX1-300x192.png",
        "filename": "CygnusX1.png",
        "mimeType": "image/png",
        "filesize": 521968,
        "width": 1176,
        "height": 754,
        "focalX": 50,
        "focalY": 50,
        "sizes": {
          "thumbnail": {
            "url": "/media/CygnusX1-300x192.png",
            "width": 300,
            "height": 192,
            "mimeType": "image/png",
            "filesize": 46065,
            "filename": "CygnusX1-300x192.png"
          },
          "square": {
            "url": "/media/CygnusX1-500x500.png",
            "width": 500,
            "height": 500,
            "mimeType": "image/png",
            "filesize": 191309,
            "filename": "CygnusX1-500x500.png"
          },
          "small": {
            "url": "/media/CygnusX1-600x385.png",
            "width": 600,
            "height": 385,
            "mimeType": "image/png",
            "filesize": 156151,
            "filename": "CygnusX1-600x385.png"
          },
          "medium": {
            "url": "/media/CygnusX1-900x577.png",
            "width": 900,
            "height": 577,
            "mimeType": "image/png",
            "filesize": 322399,
            "filename": "CygnusX1-900x577.png"
          },
          "large": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "xlarge": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "og": {
            "url": "/media/CygnusX1-1200x630.png",
            "width": 1200,
            "height": 630,
            "mimeType": "image/png",
            "filesize": 500196,
            "filename": "CygnusX1-1200x630.png"
          }
        }
      }
    }
  },
  {
    "id": 8,
    "displayOrder": 5,
    "title": "Stingray Explorer",
    "shortDescription": "Cross-platform desktop app for X-ray astronomy timing analysis built with Electron, React, and FastAPI. Interactive Plotly.js plots for light curves, power spectra, and more. GSoC 2024.",
    "description": "Cross-platform desktop app for X-ray astronomy timing analysis built with Electron, React, and FastAPI. Interactive Plotly.js plots for light curves, power spectra, and more. GSoC 2024.",
    "category": "scientific-computing",
    "projectStatus": "active",
    "slug": "stingray-explorer",
    "publishedAt": "2025-07-06T17:49:11.315Z",
    "updatedAt": "2025-09-09T06:12:08.209Z",
    "createdAt": "2025-07-06T17:48:55.020Z",
    "coverImage": {
      "id": 4,
      "alt": "Stingray Explorer",
      "caption": null,
      "updatedAt": "2025-07-14T05:46:34.891Z",
      "createdAt": "2025-07-14T05:46:34.630Z",
      "url": "/media/stingray-explorer.png",
      "thumbnailURL": "/media/stingray-explorer-300x300.png",
      "filename": "stingray-explorer.png",
      "mimeType": "image/png",
      "filesize": 79531,
      "width": 500,
      "height": 500,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/stingray-explorer-300x300.png",
          "width": 300,
          "height": 300,
          "mimeType": "image/png",
          "filesize": 34675,
          "filename": "stingray-explorer-300x300.png"
        },
        "square": {
          "url": "/media/stingray-explorer-500x500.png",
          "width": 500,
          "height": 500,
          "mimeType": "image/png",
          "filesize": 59937,
          "filename": "stingray-explorer-500x500.png"
        },
        "small": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "medium": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "large": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "xlarge": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "og": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        }
      }
    },
    "techStack": [
      {
        "technology": "Python"
      },
      {
        "technology": "Dockerfile"
      },
      {
        "technology": "CSS"
      }
    ],
    "links": {
      "githubUrl": "https://github.com/StingraySoftware/StingrayExplorer",
      "demoUrl": "https://kartikmandar-stingrayexplorer.hf.space/explorer",
      "githubStats": {
        "stars": 2,
        "forks": 3,
        "watchers": 2,
        "openIssues": 1,
        "language": "Python",
        "size": 618,
        "lastUpdated": "2025-06-12T17:38:48.000Z"
      }
    },
    "projectDetails": {
      "linesOfCode": 7825,
      "futureWork": "Interactive analysis",
      "readme": "---\ntitle: Stingray Explorer\nemoji: 🚀\ncolorFrom: gray\ncolorTo: green\nsdk: docker\npinned: false\nlicense: mit\nthumbnail: >-\n  https://cdn-uploads.huggingface.co/production/uploads/668d17c6e6887d1f6afde2a6/4q5lnlS6-eJ_JBh8tW3_I.png\nshort_description: Stingray Explorer Dashboard Demo\n---\n\n# StingrayExplorer\n\nStingrayExplorer is a comprehensive data analysis and visualization dashboard designed for X-ray astronomy time series data. Built on top of the Stingray library, it provides an intuitive graphical interface for analyzing event lists, generating light curves, computing various types of spectra, and performing advanced timing analysis.\n\n## Overview\n\nStingrayExplorer combines the powerful timing analysis capabilities of the Stingray library with a modern, interactive dashboard built using Panel and HoloViz. It enables astronomers to:\n\n- Load and analyze event lists from various X-ray telescopes\n- Generate and manipulate light curves\n- Compute power spectra, cross spectra, and bispectra\n- Analyze dynamical power spectra and power colors\n- Visualize results through interactive plots\n- Export analysis results in multiple formats\n\nThe dashboard is designed to be user-friendly while providing access to advanced features for experienced users.\n\n## Key Features\n\n### Data Loading and Management\n- Support for multiple file formats (FITS, HDF5, ASCII, etc.)\n- Batch loading of multiple event lists\n- Automatic GTI (Good Time Interval) handling\n- Energy calibration using RMF (Response Matrix File)\n- File preview and metadata inspection\n\n### Event List Analysis\n- Event list creation and simulation\n- Deadtime correction\n- Energy filtering and PI channel conversion\n- Event list joining and sorting\n- Color and intensity evolution analysis\n\n### Spectral Analysis\n- Power spectrum computation\n- Cross spectrum analysis\n- Averaged power/cross spectra\n- Bispectrum calculation\n- Dynamical power spectrum visualization\n- Power color analysis\n\n### Interactive Visualization\n- Real-time plot updates\n- Customizable plot layouts\n- Floating plot panels\n- Interactive plot manipulation\n- Multiple visualization options\n\n### System Features\n- Resource monitoring (CPU, RAM usage)\n- Warning and error handling\n- Comprehensive help documentation\n- Responsive layout design\n\n## Architecture\n\nThe project follows a modular architecture with clear separation of concerns:\n\n### Core Components\n\n1. **explorer.py**: Main entry point and dashboard initialization\n   - Panel/HoloViz setup\n   - Layout configuration\n   - Component integration\n\n2. **modules/**: Core functionality modules\n   - **DataLoading/**: Data ingestion and management\n   - **Home/**: Dashboard home page and navigation\n   - **QuickLook/**: Analysis tools and visualizations\n     - EventList handling\n     - Light curve generation\n     - Spectral analysis\n     - Power color computation\n\n3. **utils/**: Utility classes and functions\n   - **DashboardClasses.py**: Reusable UI components\n   - **sidebar.py**: Navigation and control\n   - **globals.py**: Global state management\n   - **strings.py**: Text content\n\n4. **assets/**: Static resources\n   - Images and icons\n   - CSS stylesheets\n   - Documentation assets\n\n5. **files/**: Data storage\n   - Sample data files\n   - User-loaded data\n   - Analysis outputs\n\n### Technology Stack\n\n- **Backend**: Python 3.11+\n- **Frontend**: Panel, HoloViz\n- **Data Analysis**: Stingray, NumPy, Astropy\n- **Visualization**: Bokeh, Matplotlib\n- **Deployment**: Docker, Hugging Face Spaces\n\n## Installation Guide\n\n### Prerequisites\n\n- Python 3.11 or above\n- Conda package manager\n- Git (for cloning the repository)\n\n### Dependencies\n\nCore packages:\n- Panel >= 1.3.0\n- HoloViews >= 1.18.0\n- Stingray >= 0.3\n- NumPy >= 1.24.0\n- Astropy >= 5.0\n- Matplotlib >= 3.7.0\n- Bokeh >= 3.3.0\n\n### Setup Instructions\n\n1. Clone the repository:\n   ```bash\n   git clone https://github.com/kartikmandar-GSOC24/StingrayExplorer.git\n   cd StingrayExplorer\n   ```\n\n2. Create and activate the conda environment:\n   ```bash\n   conda env create -f environment.yml\n   conda activate stingray-env\n   ```\n\n3. Verify installation:\n   ```bash\n   python -c \"import stingray; import panel; import holoviews\"\n   ```\n\n### Troubleshooting Dependencies\n\nIf you encounter dependency conflicts:\n\n1. Check individual package versions:\n   ```bash\n   conda list stingray\n   conda list panel\n   conda list holoviews\n   ```\n\n2. Try installing missing dependencies:\n   ```bash\n   conda install -c conda-forge <package_name>\n   # or\n   pip install <package_name>\n   ```\n\n3. Common issues:\n   - Stingray version compatibility\n   - Panel/HoloViews version mismatch\n   - Missing system libraries\n\n4. Support channels:\n   - Email: kartik4321mandar@gmail.com\n   - Stingray Slack: @kartikmandar\n   - GitHub Issues\n\n## Deployment Options\n\n### Local Development Server\n\nRun the application locally:\n```bash\npanel serve explorer.py --autoreload --static-dirs assets=./assets\n```\n\nThis starts a development server with:\n- Auto-reloading on file changes\n- Static file serving\n- Debug information\n- Default port 5006\n\n### Docker Deployment\n\n1. Build the image:\n   ```bash\n   docker build -t stingray-explorer .\n   ```\n\n2. Run the container:\n   ```bash\n   docker run -p 7860:7860 stingray-explorer\n   ```\n\n3. Access the application at `http://localhost:7860`\n\n### Hugging Face Spaces\n\nThe dashboard is deployed on Hugging Face Spaces:\n- Live demo: [https://kartikmandar-stingrayexplorer.hf.space/explorer](https://kartikmandar-stingrayexplorer.hf.space/explorer)\n- Repository: [https://huggingface.co/spaces/kartikmandar/StingrayExplorer](https://huggingface.co/spaces/kartikmandar/StingrayExplorer)\n- Website demo: [https://www.kartikmandar.com/gsoc-2024/stingray-explorer](https://www.kartikmandar.com/gsoc-2024/stingray-explorer)\n\n### Continuous Integration\n\nGitHub Actions automatically sync changes to Hugging Face Spaces:\n- Triggers on pushes to `main` branch\n- Builds and deploys Docker image\n- Updates Hugging Face Space\n\n## Usage Guide\n\n### Quick Start\n\n1. Launch the application:\n   ```bash\n   panel serve explorer.py --autoreload --static-dirs assets=./assets\n   ```\n\n2. Navigate to `http://localhost:5006` in your browser\n\n3. Basic workflow:\n   - Use the sidebar navigation\n   - Load data files\n   - Generate visualizations\n   - Export results\n\n### Data Loading\n\n1. Click \"Read Data\" in the sidebar\n2. Choose from multiple options:\n   - Load local files\n   - Fetch from URL\n   - Use sample data\n\nSupported formats:\n- FITS event files\n- HDF5 files\n- ASCII tables\n- ECSV files\n\n### Analysis Tools\n\n1. **Event List Operations**\n   - Create/simulate event lists\n   - Apply deadtime corrections\n   - Filter by energy range\n   - Convert PI to energy\n\n2. **Light Curve Analysis**\n   - Generate light curves\n   - Apply GTI filters\n   - Compute statistics\n   - Plot time series\n\n3. **Spectral Analysis**\n   - Compute power spectra\n   - Generate cross spectra\n   - Calculate bispectra\n   - Analyze power colors\n\n4. **Advanced Features**\n   - Dynamical power spectra\n   - Color evolution\n   - Intensity analysis\n   - Custom plotting\n\n### Visualization Options\n\n1. **Plot Types**\n   - Time series\n   - Spectral plots\n   - Contour plots\n   - Scatter plots\n\n2. **Interactive Features**\n   - Zoom/pan\n   - Hover tooltips\n   - Plot customization\n   - Export options\n\n3. **Layout Options**\n   - Floating panels\n   - Grid arrangements\n   - Multiple views\n   - Responsive design\n\n### Data Export\n\n- Save plots as PNG/SVG\n- Export data as CSV/FITS\n- Save analysis results\n- Generate reports\n\n## Development Guide\n\n### Setting Up Development Environment\n\n1. Fork and clone the repository\n2. Create development environment:\n   ```bash\n   conda env create -f environment.yml\n   conda activate stingray-env\n   ```\n3. Install development dependencies:\n   ```bash\n   pip install -r docs/requirements.txt\n   ```\n\n### Project Structure\n\n```\nstingray-explorer/\n├── explorer.py          # Main application entry point\n├── modules/            # Core functionality modules\n│   ├── DataLoading/   # Data ingestion components\n│   ├── Home/          # Dashboard home components\n│   └── QuickLook/     # Analysis tools\n├── utils/             # Utility functions and classes\n├── assets/            # Static resources\n├── files/            # Data files\n└── tests/            # Test suite\n```\n\n### Development Workflow\n\n1. Create feature branch:\n   ```bash\n   git checkout -b feature/new-feature\n   ```\n\n2. Make changes and test:\n   ```bash\n   # Run tests\n   pytest tests/\n   \n   # Start development server\n   panel serve explorer.py --autoreload\n   ```\n\n3. Submit pull request:\n   - Fork repository\n   - Push changes\n   - Create PR with description\n\n### Coding Standards\n\n- Follow PEP 8 style guide\n- Add docstrings (NumPy format)\n- Write unit tests\n- Update documentation\n\n### Testing\n\nRun test suite:\n```bash\npytest tests/\n```\n\nTest coverage:\n```bash\npytest --cov=./ tests/\n```\n\n## Troubleshooting Guide\n\n### Common Issues\n\n1. **Installation Problems**\n   - Dependency conflicts\n   - Python version mismatch\n   - Missing system libraries\n\n   Solution: Check versions, use conda-forge channel\n\n2. **Import Errors**\n   - Missing packages\n   - Version incompatibilities\n   - Path issues\n\n   Solution: Verify environment, check imports\n\n3. **Runtime Errors**\n   - Memory issues\n   - Performance problems\n   - Display errors\n\n   Solution: Monitor resources, check logs\n\n4. **Data Loading Issues**\n   - File format problems\n   - Permission errors\n   - Corrupt files\n\n   Solution: Verify file integrity, check formats\n\n### Performance Optimization\n\n1. **Memory Management**\n   - Use chunked loading\n   - Clear unused data\n   - Monitor memory usage\n\n2. **Speed Improvements**\n   - Enable caching\n   - Optimize computations\n   - Use efficient algorithms\n\n3. **Display Performance**\n   - Limit plot sizes\n   - Use appropriate renderers\n   - Optimize updates\n\n### Getting Help\n\n1. **Documentation**\n   - Read the docs\n   - Check examples\n   - Review tutorials\n\n2. **Support Channels**\n   - GitHub Issues\n   - Email support\n   - Slack channel\n\n3. **Debugging**\n   - Check logs\n   - Use debugger\n   - Print statements\n\n## License and Credits\n\n### License\n\nThis project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.\n\n### Credits\n\n- **Stingray Library**: Core timing analysis functionality\n- **Panel/HoloViz**: Interactive visualization framework\n- **Contributors**: See [GitHub contributors page](https://github.com/kartikmandar-GSOC24/StingrayExplorer/graphs/contributors)\n\n### Acknowledgments\n\n- The Stingray development team\n- HoloViz community\n- X-ray astronomy community\n- Google Summer of Code program\n",
      "readmeIsMarkdown": true,
      "totalCommits": 94,
      "fileCount": 69,
      "directoryCount": 17,
      "repositorySize": 618,
      "defaultBranch": "main",
      "isArchived": false,
      "isFork": false,
      "license": "MIT License",
      "createdAt": "2024-07-12T20:44:55.000Z",
      "homepage": "",
      "contributors": [
        {
          "name": "kartikmandar",
          "contributions": 93,
          "githubUrl": "https://github.com/kartikmandar",
          "avatarUrl": "https://avatars.githubusercontent.com/u/92812266?v=4"
        }
      ],
      "fileTree": [
        {
          "path": ".gitattributes",
          "type": "blob",
          "size": 449,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/80bbc6d98f2ede695a5c64eb52ddace67d877bbf"
        },
        {
          "path": ".github",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/02ca3396322fdf751a4f985ce3fcd4d1482d1c11"
        },
        {
          "path": ".github/workflows",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/e46427c291a9a70c430b255dd8fb19f81880ea31"
        },
        {
          "path": ".github/workflows/check.yml",
          "type": "blob",
          "size": 453,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/4f46205563759db82bdad4d3dab4f74196943ea2"
        },
        {
          "path": ".github/workflows/main.yml",
          "type": "blob",
          "size": 486,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/e7ec74e1d96350d8b95be9efacef2e52d451ed62"
        },
        {
          "path": ".gitignore",
          "type": "blob",
          "size": 71,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/f245f2e001999fe9291df00ee49d2bba065ca42f"
        },
        {
          "path": ".readthedocs.yaml",
          "type": "blob",
          "size": 235,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/0b7e55cb514290c76d17ceb91a4451d01f0d1683"
        },
        {
          "path": "AboutUs.md",
          "type": "blob",
          "size": 118,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/4ee7077fa3114e766c8844253026d128610aedcc"
        },
        {
          "path": "CODE_OF_CONDUCT.md",
          "type": "blob",
          "size": 5229,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/6aa27b375639fd88231eafadc6ca6c222899c4f0"
        },
        {
          "path": "ContactUs.md",
          "type": "blob",
          "size": 150,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/32da6ee6ca2ace1e760492d3c38ca24c84ab76e5"
        },
        {
          "path": "Dockerfile",
          "type": "blob",
          "size": 1400,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/f3063608f01885f9b0487c5e7687db5081610caa"
        },
        {
          "path": "LICENSE",
          "type": "blob",
          "size": 1069,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/39b3440ee89660d6eaba985cf78f03fc6bf1ecb3"
        },
        {
          "path": "PrivacyPolicy.md",
          "type": "blob",
          "size": 733,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/431c2b1b4002f3b24587b320e4b0cf5abc0f38c7"
        },
        {
          "path": "README.md",
          "type": "blob",
          "size": 10700,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/83d2c3951c4d07d475a8c5aea34734fe00c2e51d"
        },
        {
          "path": "Support.md",
          "type": "blob",
          "size": 342,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/bfd5264543dcac0d6591f4dce4b7dcdf47fd9539"
        },
        {
          "path": "TermsOfService.md",
          "type": "blob",
          "size": 895,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/b167724a75f471aa721a350c3e7220e6879efe73"
        },
        {
          "path": "assets",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/2a67a0dbd733621327defd35a1dbde061310a059"
        },
        {
          "path": "assets/icons",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/ddd9503dbad54ceac9edd8cc35e085927387594c"
        },
        {
          "path": "assets/icons/svg.py",
          "type": "blob",
          "size": 1057,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/1ec87bfb6c8a8bba83cafe508fb9bf0e87706d97"
        },
        {
          "path": "assets/images",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/ffa191df93e8e1dbe236d637fc89d64139a1ce64"
        },
        {
          "path": "assets/images/holoviz_logo.png",
          "type": "blob",
          "size": 28457,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/a5a928ed298f8fbf2ac79b2d59a0f2f3250e4687"
        },
        {
          "path": "assets/images/holoviz_logo_minimised.png",
          "type": "blob",
          "size": 1665,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/043c7e503f402a9ad04d8e655761c527bc6fa35e"
        },
        {
          "path": "assets/images/stingray_explorer.png",
          "type": "blob",
          "size": 79531,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/61a44990c05ab24caf4d588c23b91a58f5c79085"
        },
        {
          "path": "assets/images/stingray_explorer.webp",
          "type": "blob",
          "size": 117390,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/5a9e18c3645905adb3060daf3d987870dc187cb6"
        },
        {
          "path": "assets/images/stingray_explorer_minimised.png",
          "type": "blob",
          "size": 4325,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/efd2ad7ee90ce12feea693849bd7a87cbdf61cad"
        },
        {
          "path": "assets/images/stingray_logo.png",
          "type": "blob",
          "size": 74725,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/971fb4f856026ad2114c1325202a112e77c02c11"
        },
        {
          "path": "assets/images/stingray_logo_minimised.png",
          "type": "blob",
          "size": 1729,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/be5d2422636fd672ccf0c1d543db214faa737678"
        },
        {
          "path": "assets/stylesheets",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/d2df028e0cb94e2004e83b065db8ba2252f578f1"
        },
        {
          "path": "assets/stylesheets/explorer.css",
          "type": "blob",
          "size": 68,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/22303194cdeb2d4e65b76ed48a6a41d469c76e79"
        },
        {
          "path": "docs",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/f8a31d63bd377650585406c9b98966cdce9b3851"
        },
        {
          "path": "docs/Makefile",
          "type": "blob",
          "size": 638,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/d0c3cbf1020d5c292abdedf27627c6abe25e2293"
        },
        {
          "path": "docs/make.bat",
          "type": "blob",
          "size": 804,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/747ffb7b3033659bdd2d1e6eae41ecb00358a45e"
        },
        {
          "path": "docs/requirements.txt",
          "type": "blob",
          "size": 58,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/d5db46764b6cbd7f6bf72782cd6d0e33bb30607f"
        },
        {
          "path": "docs/source",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/2b1d134459267c0a4b5bd46b22c4925acd4b3d77"
        },
        {
          "path": "docs/source/DataLoading.rst",
          "type": "blob",
          "size": 642,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/d98b5d284185e472e3c6b76660c741443971d26a"
        },
        {
          "path": "docs/source/Home.rst",
          "type": "blob",
          "size": 594,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/f49883f904bdd35fe812d63bad933d58d86b5993"
        },
        {
          "path": "docs/source/QuickLook.rst",
          "type": "blob",
          "size": 2497,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/afe101e936b47d9f03bc0ce017c46ca20541c17c"
        },
        {
          "path": "docs/source/conf.py",
          "type": "blob",
          "size": 1671,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/024f4b3026f7f34d5b788afb3024be3edac5e8bc"
        },
        {
          "path": "docs/source/index.rst",
          "type": "blob",
          "size": 663,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/d1d9fe704ba80aa693b571410e26fba6d98142e7"
        },
        {
          "path": "docs/source/modules.rst",
          "type": "blob",
          "size": 47,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/662036933ad9f93eee031a42f3eddafe02f1a062"
        },
        {
          "path": "environment.yml",
          "type": "blob",
          "size": 19233,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/7966337f7750549ba4dfa9755872a9d315fa2841"
        },
        {
          "path": "explorer.py",
          "type": "blob",
          "size": 6367,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/ea40b70296fd08d8c5ba5c2c8d60f5d00e7ae7e9"
        },
        {
          "path": "files",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/3fbd4e7b37cc34cd9efcbdfd27df9c9ace3f177b"
        },
        {
          "path": "files/data",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/cd3a2a43a6678c2afc4122fe55b2d69d81cfb72b"
        },
        {
          "path": "files/data/LightCurve_bexvar.fits",
          "type": "blob",
          "size": 131,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/0a56c6f495f0ee9dfd472cc2bc766ea3fad09736"
        },
        {
          "path": "files/data/SE1_7ceb190-7cec25b.evt.gz",
          "type": "blob",
          "size": 133,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/1619b4b576db76c9e82592164cbaa5b0f621420d"
        },
        {
          "path": "files/data/data_small.hdf5",
          "type": "blob",
          "size": 134,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/044e043e149ab74aaf3eb8eb64d3765c4071fe8a"
        },
        {
          "path": "files/data/data_smaller.hdf5",
          "type": "blob",
          "size": 134,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/592742044471ee35987b634ce96c27ca6a63e082"
        },
        {
          "path": "files/data/lcurveA.fits",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/f23cf35556e480d5ab11547d90accccd2562f8d5"
        },
        {
          "path": "files/data/lcurve_new.fits",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/1143c2b2c55e95f1851ba5d0590961adddd3935d"
        },
        {
          "path": "files/data/monol_testA.evt",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/a613e900a003c9fe739a69cc09c05db70317b01f"
        },
        {
          "path": "files/data/monol_testA_calib.evt",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/c52ef53ddfe02154cde1bfc206a8bc11e56ea8da"
        },
        {
          "path": "files/data/monol_testA_calib_unsrt.evt",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/acd75f68334db0144f7d638af229aa7b8fd94baa"
        },
        {
          "path": "files/data/nomission.evt",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/b26ea070e4671e422af749219101e1937df3a87d"
        },
        {
          "path": "files/data/test.rmf",
          "type": "blob",
          "size": 133,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/66ddca3e601f2887f3b8d4599971a53ee27cfb45"
        },
        {
          "path": "files/data/xte_gx_test.evt.gz",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/01e6b8a914f392cc9c8fe241939855712f430fd1"
        },
        {
          "path": "files/data/xte_test.evt.gz",
          "type": "blob",
          "size": 130,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/e924159636b08afa01095fb1a9a1f8f252266fc8"
        },
        {
          "path": "modules",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/a20aa4e7b48856f43b55651424a9ded9f4ba8761"
        },
        {
          "path": "modules/DataLoading",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/933fb3d728acfa6754c2a2231f4926b40ca3f8f4"
        },
        {
          "path": "modules/DataLoading/DataIngestion.py",
          "type": "blob",
          "size": 46013,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/cd3fdc1273397f78519f96a1cf11915f14fdb23d"
        },
        {
          "path": "modules/DataLoading/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "modules/Home",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/3ea5209d4d0d12ac7de15e90ae5f758e1e271cc8"
        },
        {
          "path": "modules/Home/HomeContent.py",
          "type": "blob",
          "size": 12769,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/e14942667f0a3473c16f357344d249f85a59e2dd"
        },
        {
          "path": "modules/Home/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "modules/QuickLook",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/7a413cd9a6a1402983ff9f9eb604a7523a1ce9d0"
        },
        {
          "path": "modules/QuickLook/AverageCrossSpectrum.py",
          "type": "blob",
          "size": 11470,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/9ec40b82803cfd6eb1b6003861281ec05b78d29f"
        },
        {
          "path": "modules/QuickLook/AveragePowerSpectrum.py",
          "type": "blob",
          "size": 17642,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/2ec7756ce6c713f35f4c54e4d6866f31557752b0"
        },
        {
          "path": "modules/QuickLook/Bispectrum.py",
          "type": "blob",
          "size": 11280,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/4ea1c8815b6e0e4b477d69c3db3fbe232792ec71"
        },
        {
          "path": "modules/QuickLook/CrossSpectrum.py",
          "type": "blob",
          "size": 10576,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/b4f7864d48e44d21878f1ca89fde73c7a3650887"
        },
        {
          "path": "modules/QuickLook/DynamicalPowerSpectrum.py",
          "type": "blob",
          "size": 10399,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/a6dfc22b1171ac3fd43e862a52570cababbcd597"
        },
        {
          "path": "modules/QuickLook/EventList.py",
          "type": "blob",
          "size": 66341,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/b1953d6caf17fce8d2a652e5ba8f8c8c211c5b51"
        },
        {
          "path": "modules/QuickLook/LightCurve.py",
          "type": "blob",
          "size": 15542,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/ec3472d82a0342653878b1e1219ed4de55405f1d"
        },
        {
          "path": "modules/QuickLook/PowerColors.py",
          "type": "blob",
          "size": 6062,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/f8ca73c79c5a31bbf681043b1a888a9a67eb192f"
        },
        {
          "path": "modules/QuickLook/PowerSpectrum.py",
          "type": "blob",
          "size": 19546,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/0b3a4bff9be60248168c64803b70b09a6be23c14"
        },
        {
          "path": "modules/QuickLook/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "pyproject.toml",
          "type": "blob",
          "size": 467,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/cf5ad949352c1f0224f1a7798556c37c989163c7"
        },
        {
          "path": "setup.py",
          "type": "blob",
          "size": 344,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/3330a08c16249f6d71ffa49ea04032d4a5de7ff7"
        },
        {
          "path": "tests",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/0e579a6a0779aa2e764568a3d482d0cb58dc8c31"
        },
        {
          "path": "tests/test_dataloading",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/210fde8932607b372ff202a949481ba0a8160326"
        },
        {
          "path": "tests/test_dataloading/test_dataingestion.py",
          "type": "blob",
          "size": 7399,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/3f2b92467bd2b3afd479fb3304daeac938b0d6e5"
        },
        {
          "path": "utils",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/trees/b34fbde9e0fc50c17f7f58db665459e271389e35"
        },
        {
          "path": "utils/DashboardClasses.py",
          "type": "blob",
          "size": 11269,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/9a4158dc539480c96573b5d7d75f6e7b45adfa46"
        },
        {
          "path": "utils/dashboardClasses.py",
          "type": "blob",
          "size": 11269,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/9a4158dc539480c96573b5d7d75f6e7b45adfa46"
        },
        {
          "path": "utils/globals.py",
          "type": "blob",
          "size": 120,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/216fd47321e3f6df37e7077476fd68eaf06d97f6"
        },
        {
          "path": "utils/sidebar.py",
          "type": "blob",
          "size": 16470,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/a5ac9e7015a08000845259e115dba68f5556d00f"
        },
        {
          "path": "utils/strings.py",
          "type": "blob",
          "size": 19102,
          "url": "https://api.github.com/repos/StingraySoftware/StingrayExplorer/git/blobs/b423dee2a34f7bff6e74e61d16e63676b5430ed3"
        }
      ],
      "githubIssues": {
        "total": 1,
        "open": 0,
        "closed": 0
      },
      "githubPullRequests": {
        "total": 1,
        "open": 1,
        "closed": 0,
        "merged": 0
      }
    },
    "branches": [
      {
        "name": "main",
        "commitSha": "2b23194be2fed290529a9ca70d7ef59d7de69235"
      }
    ],
    "lastGitHubSync": "2025-09-09T06:12:08.115Z",
    "meta": {
      "title": "Stingray Explorer",
      "description": "This is the dashboard build for the Google Summer of Code 2024 project. ",
      "image": {
        "id": 4,
        "alt": "Stingray Explorer",
        "caption": null,
        "updatedAt": "2025-07-14T05:46:34.891Z",
        "createdAt": "2025-07-14T05:46:34.630Z",
        "url": "/media/stingray-explorer.png",
        "thumbnailURL": "/media/stingray-explorer-300x300.png",
        "filename": "stingray-explorer.png",
        "mimeType": "image/png",
        "filesize": 79531,
        "width": 500,
        "height": 500,
        "focalX": 50,
        "focalY": 50,
        "sizes": {
          "thumbnail": {
            "url": "/media/stingray-explorer-300x300.png",
            "width": 300,
            "height": 300,
            "mimeType": "image/png",
            "filesize": 34675,
            "filename": "stingray-explorer-300x300.png"
          },
          "square": {
            "url": "/media/stingray-explorer-500x500.png",
            "width": 500,
            "height": 500,
            "mimeType": "image/png",
            "filesize": 59937,
            "filename": "stingray-explorer-500x500.png"
          },
          "small": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "medium": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "large": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "xlarge": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          },
          "og": {
            "url": null,
            "width": null,
            "height": null,
            "mimeType": null,
            "filesize": null,
            "filename": null
          }
        }
      }
    }
  },
  {
    "id": 3,
    "displayOrder": 8,
    "title": "DAVE",
    "shortDescription": "Modernized legacy X-ray timing analysis desktop app — upgraded Electron 1.7 to 36.3, Python 3.5 to 3.13, added security hardening and 3x faster FFT operations.",
    "description": "A GUI for spectral-timing analysis of X-ray astronomical data.",
    "category": "scientific-computing",
    "projectStatus": "active",
    "slug": "dave",
    "publishedAt": "2025-07-06T17:45:07.972Z",
    "updatedAt": "2025-09-09T06:12:14.609Z",
    "createdAt": "2025-07-06T17:44:34.403Z",
    "coverImage": {
      "id": 12,
      "alt": "DAVE",
      "caption": null,
      "updatedAt": "2025-07-14T06:37:49.998Z",
      "createdAt": "2025-07-14T06:37:45.925Z",
      "url": "/media/DAVE.png",
      "thumbnailURL": "/media/DAVE-300x162.png",
      "filename": "DAVE.png",
      "mimeType": "image/png",
      "filesize": 1425570,
      "width": 2770,
      "height": 1492,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/DAVE-300x162.png",
          "width": 300,
          "height": 162,
          "mimeType": "image/png",
          "filesize": 54088,
          "filename": "DAVE-300x162.png"
        },
        "square": {
          "url": "/media/DAVE-500x500.png",
          "width": 500,
          "height": 500,
          "mimeType": "image/png",
          "filesize": 136484,
          "filename": "DAVE-500x500.png"
        },
        "small": {
          "url": "/media/DAVE-600x323.png",
          "width": 600,
          "height": 323,
          "mimeType": "image/png",
          "filesize": 167273,
          "filename": "DAVE-600x323.png"
        },
        "medium": {
          "url": "/media/DAVE-900x485.png",
          "width": 900,
          "height": 485,
          "mimeType": "image/png",
          "filesize": 314615,
          "filename": "DAVE-900x485.png"
        },
        "large": {
          "url": "/media/DAVE-1400x754.png",
          "width": 1400,
          "height": 754,
          "mimeType": "image/png",
          "filesize": 604697,
          "filename": "DAVE-1400x754.png"
        },
        "xlarge": {
          "url": "/media/DAVE-1920x1034.png",
          "width": 1920,
          "height": 1034,
          "mimeType": "image/png",
          "filesize": 966134,
          "filename": "DAVE-1920x1034.png"
        },
        "og": {
          "url": "/media/DAVE-1200x630.png",
          "width": 1200,
          "height": 630,
          "mimeType": "image/png",
          "filesize": 471153,
          "filename": "DAVE-1200x630.png"
        }
      }
    },
    "techStack": [
      {
        "technology": "JavaScript"
      },
      {
        "technology": "Python"
      },
      {
        "technology": "Shell"
      },
      {
        "technology": "HTML"
      },
      {
        "technology": "Jupyter Notebook"
      },
      {
        "technology": "CSS"
      }
    ],
    "links": {
      "githubUrl": "https://github.com/StingraySoftware/dave",
      "githubStats": {
        "stars": 16,
        "forks": 14,
        "watchers": 16,
        "openIssues": 5,
        "language": "JavaScript",
        "size": 9933,
        "lastUpdated": "2024-04-01T09:17:22.000Z"
      }
    },
    "projectDetails": {
      "linesOfCode": 8318,
      "futureWork": "Modernising the stack to work with current tech",
      "readme": "# DAVE\n\nDAVE stands for Data Analysis of Variable Events, which is a GUI built on top of\nthe [Stingray library](https://github.com/StingraySoftware/stingray). It is\nintended to be used by astronomers for time-series analysis in general, and\nanalysis of variable sources in particular.\n\nThe goal is to enable scientific exploration of astronomical X-Ray\nobservations and to analyse this data in a graphical environment.\n\n\n## Get Started\n\n* Clone the project `$ git clone https://github.com/StingraySoftware/dave`\n* Install a Python virtual env and a compatible version of node: `$ source setup/setup.bash`\n* Run the application for development: `$ setup/run_gui.bash`\n* Or run the build script for Linux_X64 `$ setup/build_linux-x64.bash` for getting the distributable at DAVE build folder.\n\nYou will see that there's plenty left to do!\n\nNOTE: Mac OSX dependencies\n* At least Homebrew installed (http://brew.sh/) or MacPorts installed (https://www.macports.org)\n* If MacPorts will be used, you have two available options:\n* 1 - Install LibMagic by yourself running this MacPorts command `sudo /opt/local/bin/port install file` on the terminal and then launch DAVE running `DAVEApp.app/Contents/MacOS/DAVEApp`.\n* 2 - Launch DAVE as root running this command on the terminal: `sudo DAVEApp.app/Contents/MacOS/DAVEApp`\n\n\n## Contribute\n\nPlease talk to us! We use Slack to discuss the work. Use http://slack-invite.timelabtechnologies.com to self-invite yourself on the slack. Also, feel free to contact us at info@timelabtechnologies.com .\n\nThe recorded open issues for DAVE are in [JIRA](https://timelabdev.com/jira/projects/DAVE). More information about communication in the project can be found in [Confluence](https://timelabdev.com/wiki/display/DAVE/Source+code+and+communication).\n\nFork and pull request away!\n",
      "readmeIsMarkdown": true,
      "totalCommits": 664,
      "fileCount": 312,
      "directoryCount": 80,
      "repositorySize": 9933,
      "defaultBranch": "master",
      "isArchived": false,
      "isFork": false,
      "license": "Apache License 2.0",
      "createdAt": "2016-06-12T10:39:23.000Z",
      "homepage": "",
      "contributors": [
        {
          "name": "ricardovb",
          "contributions": 287,
          "githubUrl": "https://github.com/ricardovb",
          "avatarUrl": "https://avatars.githubusercontent.com/u/24554037?v=4"
        },
        {
          "name": "pbalm",
          "contributions": 112,
          "githubUrl": "https://github.com/pbalm",
          "avatarUrl": "https://avatars.githubusercontent.com/u/7280159?v=4"
        },
        {
          "name": "crystal95",
          "contributions": 64,
          "githubUrl": "https://github.com/crystal95",
          "avatarUrl": "https://avatars.githubusercontent.com/u/12841492?v=4"
        },
        {
          "name": "matteobachetti",
          "contributions": 25,
          "githubUrl": "https://github.com/matteobachetti",
          "avatarUrl": "https://avatars.githubusercontent.com/u/7190189?v=4"
        },
        {
          "name": "OrkoHunter",
          "contributions": 6,
          "githubUrl": "https://github.com/OrkoHunter",
          "avatarUrl": "https://avatars.githubusercontent.com/u/8065913?v=4"
        },
        {
          "name": "pep8speaks",
          "contributions": 1,
          "githubUrl": "https://github.com/pep8speaks",
          "avatarUrl": "https://avatars.githubusercontent.com/u/24736507?v=4"
        }
      ],
      "fileTree": [
        {
          "path": ".gitignore",
          "type": "blob",
          "size": 83,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9d81ced46f86885d6de9fa2f3050e467684278e9"
        },
        {
          "path": ".pep8speaks.yml",
          "type": "blob",
          "size": 161,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4b6fa98ec0bd59763b5673227a4354fc20e79a38"
        },
        {
          "path": "LICENSE",
          "type": "blob",
          "size": 11357,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8dada3edaf50dbc082c9a125058f25def75e625a"
        },
        {
          "path": "README.md",
          "type": "blob",
          "size": 1811,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/5787c4569327aef21e903171bd7626232aec1a09"
        },
        {
          "path": "contributors.txt",
          "type": "blob",
          "size": 110,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d2a0e27d56c82679820dd383478800a8959f21ab"
        },
        {
          "path": "setup",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/a16bba5aa857641b821f6b07b44faf5ecdfef48d"
        },
        {
          "path": "setup/build_MacOS.bash",
          "type": "blob",
          "size": 2187,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c62e02733e313432c37cbeb3f159c6ae826d3150"
        },
        {
          "path": "setup/build_linux-x64.bash",
          "type": "blob",
          "size": 2012,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8949c31da3ce46f8e44cb58a0069e52c7b9fba92"
        },
        {
          "path": "setup/config",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/dbfb8c87b5411bd3fd2c18e3272c95706382dd7f"
        },
        {
          "path": "setup/config/deply_darwin_config.js",
          "type": "blob",
          "size": 393,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d0494075d949b086d6db051dca1c6de9abb91f80"
        },
        {
          "path": "setup/config/deply_linux_config.js",
          "type": "blob",
          "size": 371,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f604ac9a276db5bbc49cc47c938929c428d4f12d"
        },
        {
          "path": "setup/environment.yml",
          "type": "blob",
          "size": 349,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/0bfe54a1c4b8777053f90e90b50a1514843a6919"
        },
        {
          "path": "setup/run_gui.bash",
          "type": "blob",
          "size": 54,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b8331e5d84c0c2710836c4fbeb9f904d729e1a24"
        },
        {
          "path": "setup/setup.bash",
          "type": "blob",
          "size": 8981,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/520d302a85291b945dc7e18a6aa8edf62a441b22"
        },
        {
          "path": "src",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/0a7716ee861f7350a05828849b16bdedf2c94b58"
        },
        {
          "path": "src/main",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/18f961b3596a63cd91f93e641950c06ede16a2f7"
        },
        {
          "path": "src/main/js",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/86ac233e714435a8c6a3234b652a3909c74f4703"
        },
        {
          "path": "src/main/js/electron",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/ed47c5060c1a64c949d3a7b731d26985da23a10d"
        },
        {
          "path": "src/main/js/electron/.gitignore",
          "type": "blob",
          "size": 50,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6f64e375b344092c091b2ea89b02c6ddfbc8fba7"
        },
        {
          "path": "src/main/js/electron/config.js",
          "type": "blob",
          "size": 365,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/bf4d401c0283089d1dc1ecf3776fe9c68270ab3d"
        },
        {
          "path": "src/main/js/electron/main.js",
          "type": "blob",
          "size": 10992,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/38286226f4c37fd9888731f405250179e264a86f"
        },
        {
          "path": "src/main/js/electron/package.json",
          "type": "blob",
          "size": 860,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d4a180cc92bc38bed167ba0920a235d67bdf6a02"
        },
        {
          "path": "src/main/python",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/ce03de1165ae1d48c7cf84ff42b7fdcbff9664c1"
        },
        {
          "path": "src/main/python/.gitignore",
          "type": "blob",
          "size": 54,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3d59ce6a8ca9bb5713a45d3fb21445e3b825ed74"
        },
        {
          "path": "src/main/python/config.py",
          "type": "blob",
          "size": 2379,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/335ade853a489ecb43e11ed4249ba5525ef0b49b"
        },
        {
          "path": "src/main/python/model",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/8f0b09e097fc84c5152dc88844c7e65180a2a49e"
        },
        {
          "path": "src/main/python/model/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "src/main/python/model/column.py",
          "type": "blob",
          "size": 3097,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6eb0944640475fcaaf5ec5cc7af400cb97819825"
        },
        {
          "path": "src/main/python/model/dataset.py",
          "type": "blob",
          "size": 9773,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/5423bde9de696a6e90d2a502469802f29f0b7d88"
        },
        {
          "path": "src/main/python/model/table.py",
          "type": "blob",
          "size": 3112,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/69282765d49af719ae31cb65192175a39e7433e5"
        },
        {
          "path": "src/main/python/server.py",
          "type": "blob",
          "size": 14987,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3b5903f1f0f2364bd51d2b878e4b0265ff579dd7"
        },
        {
          "path": "src/main/python/utils",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/b3492d5f027eaaaeae445072a53c5c7850b73497"
        },
        {
          "path": "src/main/python/utils/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "src/main/python/utils/dataset_cache.py",
          "type": "blob",
          "size": 1790,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/7ff4da1104e95d00b32707bb69966ba4128648d6"
        },
        {
          "path": "src/main/python/utils/dataset_helper.py",
          "type": "blob",
          "size": 15142,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a85a747aa41e0570b6c71d2fb00e86ce5487395c"
        },
        {
          "path": "src/main/python/utils/dave_bulk.py",
          "type": "blob",
          "size": 4225,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f3a5b581fa968cd06898279ca07178c7a6120147"
        },
        {
          "path": "src/main/python/utils/dave_endpoint.py",
          "type": "blob",
          "size": 40191,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/52436a54b47fc9499efbe7be15de0a95f17edc7b"
        },
        {
          "path": "src/main/python/utils/dave_engine.py",
          "type": "blob",
          "size": 111651,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ee4da29f63275b2143b109cc125beced2172348c"
        },
        {
          "path": "src/main/python/utils/dave_logger.py",
          "type": "blob",
          "size": 804,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3ebb4cd7e5772ffab2c47b621716032cecc10b50"
        },
        {
          "path": "src/main/python/utils/dave_reader.py",
          "type": "blob",
          "size": 17756,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9a2f02975902b341d406320be9082c8469911f8c"
        },
        {
          "path": "src/main/python/utils/exception_helper.py",
          "type": "blob",
          "size": 859,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/261800390fd7b230682c3e545fc75d7c7c6141e9"
        },
        {
          "path": "src/main/python/utils/file_utils.py",
          "type": "blob",
          "size": 2413,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a6372b5f5da7633b34822cc22be54f858759a319"
        },
        {
          "path": "src/main/python/utils/filters_helper.py",
          "type": "blob",
          "size": 2384,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/818ef04c6c7d86390a22123f6e2277920aeb0973"
        },
        {
          "path": "src/main/python/utils/gevent_helper.py",
          "type": "blob",
          "size": 1590,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3ba40d46a8cd03cd6ca421643da99d230c1bcad0"
        },
        {
          "path": "src/main/python/utils/model_helper.py",
          "type": "blob",
          "size": 7734,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ca478749b1e74f0243bc6474492ecb2d735e64af"
        },
        {
          "path": "src/main/python/utils/np_encoder.py",
          "type": "blob",
          "size": 1675,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/88bc0195519e9f44bb6c76cc3e66b5f3fabbc84c"
        },
        {
          "path": "src/main/python/utils/plotter.py",
          "type": "blob",
          "size": 2462,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/62ce40b273ae1b17f4119cb685cf8a8ee9d414a8"
        },
        {
          "path": "src/main/python/utils/session_helper.py",
          "type": "blob",
          "size": 442,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cef1e4ed334aead30c6f1800de7a07087a9f6a35"
        },
        {
          "path": "src/main/resources",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/042c0081fee36ee897bb2c19ce71e11a70d412d7"
        },
        {
          "path": "src/main/resources/bash",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/36ab4d19504d600fa35f8d90792de054c9020464"
        },
        {
          "path": "src/main/resources/bash/activate_and_launch.bash",
          "type": "blob",
          "size": 2397,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3960d6cd842e7cadf0a14485370a72ba4370e3d1"
        },
        {
          "path": "src/main/resources/bash/activate_and_launch_dev.bash",
          "type": "blob",
          "size": 1071,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/61190d24586a63813c4b3b595e23f7548b17dbd2"
        },
        {
          "path": "src/main/resources/bash/build_publish.bash",
          "type": "blob",
          "size": 1636,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c1a23254303b1429a6abb197093ad8f36490620c"
        },
        {
          "path": "src/main/resources/bash/create_env.bash",
          "type": "blob",
          "size": 5845,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/55ed76b0f591de76e80bb163025e2fc8341dc53e"
        },
        {
          "path": "src/main/resources/static",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/b6758f6efff21bb97bc6e16cc64fe60d1a311784"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/a777c770512cd51104c310e3a1dbb31e20a57792"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/css",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/52704e47b853d6619780ca285f58e90da13f22f5"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/css/font-awesome.css",
          "type": "blob",
          "size": 37414,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ee906a8196d0fbd581c27a9d5615db4c250860f2"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/css/font-awesome.min.css",
          "type": "blob",
          "size": 31000,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/540440ce89f2a408aa699b65100e18f15e0f09ca"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/fd865ec4ce5d0161aa1800bc9af3053752818f54"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts/FontAwesome.otf",
          "type": "blob",
          "size": 134808,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/401ec0f36e4f73b8efa40bd6f604fe80d286db70"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts/fontawesome-webfont.eot",
          "type": "blob",
          "size": 165742,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e9f60ca953f93e35eab4108bd414bc02ddcf3928"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts/fontawesome-webfont.svg",
          "type": "blob",
          "size": 444379,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/855c845e538b65548118279537a04eab2ec6ef0d"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts/fontawesome-webfont.ttf",
          "type": "blob",
          "size": 165548,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/35acda2fa1196aad98c2adf4378a7611dd713aa3"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts/fontawesome-webfont.woff",
          "type": "blob",
          "size": 98024,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/400014a4b06eee3d0c0d54402a47ab2601b2862b"
        },
        {
          "path": "src/main/resources/static/font-awesome-4.7.0/fonts/fontawesome-webfont.woff2",
          "type": "blob",
          "size": 77160,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4d13fc60404b91e398a37200c4a77b645cfd9586"
        },
        {
          "path": "src/main/resources/static/fonts",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/942a0032f55ba4fc68a7e935920a8b046284516e"
        },
        {
          "path": "src/main/resources/static/fonts/Archangelsk.ttf",
          "type": "blob",
          "size": 51884,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3f89b52dcfae5a6a88151088bb4dae40cfc5a075"
        },
        {
          "path": "src/main/resources/static/img",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/e87e6d7593c6e1ebb229fdaa4145dc329fd83be7"
        },
        {
          "path": "src/main/resources/static/img/bg.jpg",
          "type": "blob",
          "size": 46593,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/513a73ed8d619c048a99e99aa2330c329b9c34e6"
        },
        {
          "path": "src/main/resources/static/img/icon.icns",
          "type": "blob",
          "size": 381788,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1c1f25d47883ac15daffcaa171eb81e2edcfbdf0"
        },
        {
          "path": "src/main/resources/static/img/icon.ico",
          "type": "blob",
          "size": 370070,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/bed64f552b09f8858a90a0e8f4e041376afdd69c"
        },
        {
          "path": "src/main/resources/static/img/icon.png",
          "type": "blob",
          "size": 449668,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/41bc098cf836cdc6624c3e41cea13f4ec8962cdf"
        },
        {
          "path": "src/main/resources/static/img/icon",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/1d847a312bfae1395b2a3d6e2ea84269d732b39e"
        },
        {
          "path": "src/main/resources/static/img/icon/128x128.png",
          "type": "blob",
          "size": 23370,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2efc7d726b221c733367c175c8b4aadcc99986a9"
        },
        {
          "path": "src/main/resources/static/img/icon/16x16.png",
          "type": "blob",
          "size": 945,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c41dab140e9981a933c99fddd7b6420ac3670640"
        },
        {
          "path": "src/main/resources/static/img/icon/24x24.png",
          "type": "blob",
          "size": 1750,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/5fc9522e83f469fdae9479e4582907d8f6f5c300"
        },
        {
          "path": "src/main/resources/static/img/icon/256x256.png",
          "type": "blob",
          "size": 67805,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/857c8c6b6d07dd003ebb13a53d2fce99c33c9d88"
        },
        {
          "path": "src/main/resources/static/img/icon/32x32.png",
          "type": "blob",
          "size": 2771,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/25c876e693c997a57c0eaa7f4a567464eb6b8f3b"
        },
        {
          "path": "src/main/resources/static/img/icon/48x48.png",
          "type": "blob",
          "size": 5306,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/661893a6188e0e8e6f47e34d3ae0dccc719c293f"
        },
        {
          "path": "src/main/resources/static/img/icon/512x512.png",
          "type": "blob",
          "size": 210448,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ef953c62c4d66ff3cd3f457ee65d7ada2a859617"
        },
        {
          "path": "src/main/resources/static/img/icon/64x64.png",
          "type": "blob",
          "size": 8287,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d9c2b93795730e4b31968ed431b020a754085b03"
        },
        {
          "path": "src/main/resources/static/img/icon/96x96.png",
          "type": "blob",
          "size": 15311,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9c28b0f8d3da58b2051e745e8b4167d0fb29f3a3"
        },
        {
          "path": "src/main/resources/static/img/loading.gif",
          "type": "blob",
          "size": 81572,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e1b07ea2e5bbd9c1ebf7d719a3892a7d2917f253"
        },
        {
          "path": "src/main/resources/static/scripts",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/75e764749c5b2c04f87ec9f690a89832a7f0167f"
        },
        {
          "path": "src/main/resources/static/scripts/bulkAnalisys.js",
          "type": "blob",
          "size": 9871,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/30930e1d8d6dfc1722d4c71698591dddbb07c7fc"
        },
        {
          "path": "src/main/resources/static/scripts/common.js",
          "type": "blob",
          "size": 7157,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/289e0f87f228c1f28e7923858c688c2b92b3f461"
        },
        {
          "path": "src/main/resources/static/scripts/config.js",
          "type": "blob",
          "size": 3728,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ed769afe1ca5dbcdd901e0a68d684d67b29b34e4"
        },
        {
          "path": "src/main/resources/static/scripts/external",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/82a7cbf12066bb8d6d02376441be80758a1c68e7"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/a7a3ffe348775b36b46c9d86d633f0f5fb835899"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/MathJax.js",
          "type": "blob",
          "size": 63244,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/792f7e4506bf70836f4d0e076c567892568205db"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/config",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/f8548e44b0698e885da37842193d7c411c56ac81"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/config/TeX-AMS-MML_SVG.js",
          "type": "blob",
          "size": 240758,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/37eff360893e4be6067f8da4559a1f72bf3adb6c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/extensions",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/173c1b1660b9d908fb8413a61b4583dd1cc15a98"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/extensions/Safe.js",
          "type": "blob",
          "size": 6280,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1524924c0bacb4d05b25d5163cd3dee222fb6aef"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/8d394452ceb2390243d506fd9bb1adae85ec03e1"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/21320e31aa5d9bc5a1c966975af106e646a5f78c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/5d6c245d6dc2ae3ffca36ccc387b3130d5a04d87"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/autoload",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/c099fd8ee8d466eaa61156bd662f8f133b02a13a"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/autoload/multiline.js",
          "type": "blob",
          "size": 11912,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a910ff2bcc3a533dae25872f9323a3a2c5a9087d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/d38cca96e1caecf4d316ccf143ccd3a29a06b9bd"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/4207b5dbf6001051809e6ac0e1e90a301bf83363"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/c658742a35c9acf5f3382162c35c4c9da8209714"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/8a145e90be5a9deef479119856dce1512b3b3642"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/Arrows.js",
          "type": "blob",
          "size": 19232,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2ac89d793cf6aea8a0bd8e96fd96d7bd4c6f8da1"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/BoxDrawing.js",
          "type": "blob",
          "size": 1943,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/aadbf503b87c4c11a4fe348efaa305fafff70011"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/CombDiacritMarks.js",
          "type": "blob",
          "size": 1700,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/71235e9b499d60e0b43d28d5c29b8dda54f0545d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/Dingbats.js",
          "type": "blob",
          "size": 1741,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/501ca2a1e46dedaf75f68d839fb5ba6b405e5596"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/EnclosedAlphanum.js",
          "type": "blob",
          "size": 1811,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/38a5b6e200f29e28af6ebe662afb017511c7ea32"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/GeneralPunctuation.js",
          "type": "blob",
          "size": 1040,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9aaba16ab5f66485c41be03bd48c33bd53bf8e1e"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/GeometricShapes.js",
          "type": "blob",
          "size": 2577,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/aaa2aef4b2ee36d52028863b6cd8dc9bc0850151"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/GreekAndCoptic.js",
          "type": "blob",
          "size": 1846,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/64aaa902c6732af2936d1ab98f08ad96badc448f"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/Latin1Supplement.js",
          "type": "blob",
          "size": 3958,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/703488c7b27df4af2faf9d00eb263748387c9d92"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/LatinExtendedA.js",
          "type": "blob",
          "size": 1651,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b147550b950765d4fcde371b86beb10259377361"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/LetterlikeSymbols.js",
          "type": "blob",
          "size": 4262,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/14e2fb1d8837b4f1c47b70b96881949b6e1520d7"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/Main.js",
          "type": "blob",
          "size": 24217,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a7d19f49599eab9d38aff2acbbfd390329ea8e6b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/MathOperators.js",
          "type": "blob",
          "size": 55608,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6dd00616a2c4ccec416167ab4780914b77febb33"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/MiscMathSymbolsB.js",
          "type": "blob",
          "size": 1115,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d7fa95312455d1b0a583f4d99edc401d90a3e384"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/MiscSymbols.js",
          "type": "blob",
          "size": 1297,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3e0bc123fd83e46900d5a9b262ccc43107caed3f"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/MiscTechnical.js",
          "type": "blob",
          "size": 1379,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a2e938062a034037f2e510de3928b226f285cb2b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/PUA.js",
          "type": "blob",
          "size": 11810,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6f359cabe2bf5dc566d83b33d2da601b5b73770e"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/SpacingModLetters.js",
          "type": "blob",
          "size": 1616,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/095349528c3a85e24fdfb5417148599c89fc8da9"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/AMS/Regular/SuppMathOperators.js",
          "type": "blob",
          "size": 18287,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/40ab8f1f48180708f3035e422f6e48be64478c35"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Caligraphic",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/676530cf6a33c5b4aed3540410fee0867d1d5e9c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Caligraphic/Bold",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/c4a38af9a745488e627a9ccd017b9e6a9faeeb4e"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Caligraphic/Bold/Main.js",
          "type": "blob",
          "size": 22630,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6a4311faecbc233dd7dd58baf236e273837d774b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Caligraphic/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/c8b3f6e146229c218a47ad80e777978c31b4e43d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Caligraphic/Regular/Main.js",
          "type": "blob",
          "size": 22103,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/16427c28d5a371d3d6abddd4ad12b88b522a12bd"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/63a25d3066610d2bbc250e5c014af52a8ea4baeb"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Bold",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/3cffba130fc1bc3f5ae69b41d27841c978c51c98"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Bold/BasicLatin.js",
          "type": "blob",
          "size": 50076,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a081d0600e464a8d9ca08df3c82dd0953d07b5de"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Bold/Main.js",
          "type": "blob",
          "size": 980,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8f39e06b28a3c42837dda89fdc101ae0a8de77a5"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Bold/Other.js",
          "type": "blob",
          "size": 1219,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d04f25934eb574d70c7ed8073748c10c099818ef"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Bold/PUA.js",
          "type": "blob",
          "size": 5605,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/7c0988c9ff2c7beacc0931af48b467cb71769e3a"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/91597a16731a34d2fb00c9ef861dce0591fcf328"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Regular/BasicLatin.js",
          "type": "blob",
          "size": 48363,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/968953ed5c0842233b2a05432c838fb80de457c9"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Regular/Main.js",
          "type": "blob",
          "size": 966,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a127db19edae7820535672dbdcb3ce5851c77a66"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Regular/Other.js",
          "type": "blob",
          "size": 1219,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/95737cd137add868faccdce79fa1b91b4b5830f2"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Fraktur/Regular/PUA.js",
          "type": "blob",
          "size": 5067,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d3daf724ae49b3232184d05d76c4e71add77a7aa"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/0cba5cfc9c51156a4af3fe24aa0f6bfff30a2199"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/6d33ea52c2ce7a14e77d0d2995439ce49425d7fd"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/Arrows.js",
          "type": "blob",
          "size": 12752,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/93f644da22e3a2b0ab8d992490d7f483fbfd7c81"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/BasicLatin.js",
          "type": "blob",
          "size": 18038,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ac1520821cb98b5a0922e94dcd7eba8e192f7fb8"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/CombDiacritMarks.js",
          "type": "blob",
          "size": 3717,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ab7e02d5e023ef0b2665ff196ac2e85c9d2f7256"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/CombDiactForSymbols.js",
          "type": "blob",
          "size": 1221,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/7fb00959dab900c2cbc35d4e312b8f38836cd5ac"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/GeneralPunctuation.js",
          "type": "blob",
          "size": 4583,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/19851ec76673bb214dfe4dd3adf2fc744f642eae"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/GeometricShapes.js",
          "type": "blob",
          "size": 2339,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e3d2939f29809af3806150855525cdb38cc49b48"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/GreekAndCoptic.js",
          "type": "blob",
          "size": 5239,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a32667a9fc8df5507ffb1dabe2571596dc1aaf12"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/Latin1Supplement.js",
          "type": "blob",
          "size": 3026,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e010b4073d6cbf979f267cc2cd56e6eb2f67ae22"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/LatinExtendedA.js",
          "type": "blob",
          "size": 1293,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cb843e1fa81c9e27ee453aefe377a2e5faeceffd"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/LatinExtendedB.js",
          "type": "blob",
          "size": 1317,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/7c2c1da11f6b7b0e4cf70139ad2aa5a4bc2279c2"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/LetterlikeSymbols.js",
          "type": "blob",
          "size": 6037,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/09f9f280098de9faa9e1b427f8f65cae45353a4d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/Main.js",
          "type": "blob",
          "size": 21842,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9b9c9445936c2611dfff73cebd06720072ec850c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/MathOperators.js",
          "type": "blob",
          "size": 27338,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/76986a5e6fa49d340b71acf998eaa7292c52b1e6"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/MiscMathSymbolsA.js",
          "type": "blob",
          "size": 1315,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/77e8c045945df9074b180458717fb2dac5076b48"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/MiscSymbols.js",
          "type": "blob",
          "size": 4808,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/704e80578ad668ba2708a12e7071ee977b56d3ab"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/MiscTechnical.js",
          "type": "blob",
          "size": 2219,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/47647c0bb02312366d84c3d6dccccbc455cc9a4b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/SpacingModLetters.js",
          "type": "blob",
          "size": 2662,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/86a0ee1bf850c73a4e98e3344e0bbf4609800ef8"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/SuppMathOperators.js",
          "type": "blob",
          "size": 2392,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/facdf8010fe8e051a2ebdad77ed671ff57035028"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Bold/SupplementalArrowsA.js",
          "type": "blob",
          "size": 5283,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/724b775560cb8a424e21a275fceb9b40cced163c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/397cad62bc8d771b3e8e907180eb8be24bf8c744"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/BasicLatin.js",
          "type": "blob",
          "size": 49033,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b2a58a664143de7506247aa5b310f3cbaee363a7"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/CombDiacritMarks.js",
          "type": "blob",
          "size": 3518,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2f58aa4e7b605c6d41fffeb55232b80238d7dbff"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/GeneralPunctuation.js",
          "type": "blob",
          "size": 2708,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/08c2a485ca0e38d9d7ceb3f34b90dc5e3b0c6016"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/GreekAndCoptic.js",
          "type": "blob",
          "size": 8514,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b0365da7c32ec21f04d3cad1c4f6b148e5334418"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/LatinExtendedA.js",
          "type": "blob",
          "size": 1289,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cda9ae1714d1e2232154383bfe5dec12c947a048"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/LatinExtendedB.js",
          "type": "blob",
          "size": 1314,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cc9ae8c2bf0b805eb5a3212fd52396e5c9eed371"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/LetterlikeSymbols.js",
          "type": "blob",
          "size": 1703,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d9cc67354a2e141739b863661b323b9c388bbce9"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/Main.js",
          "type": "blob",
          "size": 1941,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/06c9dc72118fffc5e16a722fa14d73577a244978"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Italic/MathOperators.js",
          "type": "blob",
          "size": 895,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/07781faca2cf2a749da40d4d5213472bacabd7c5"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/de0d67307fa2a3109718292ed28fa2b45250ae7a"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/BasicLatin.js",
          "type": "blob",
          "size": 19906,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fe442cec533d971c3cda0979d249d75d55700250"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/CombDiacritMarks.js",
          "type": "blob",
          "size": 3452,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d1317775f8877b3e2246be84c9109140dff91425"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/GeometricShapes.js",
          "type": "blob",
          "size": 2162,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c24c3f82dfafbdd9d0cf7675d401d27d84c505b1"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/GreekAndCoptic.js",
          "type": "blob",
          "size": 5730,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/90f5f03c22280aca830633626b4d60cba2f13e20"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/LatinExtendedA.js",
          "type": "blob",
          "size": 1135,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3864c54e87c51dbde07df359f81568f28bcc899c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/LatinExtendedB.js",
          "type": "blob",
          "size": 1212,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3dee7f5be3462ed42cf4b26086d06ed66ee8154d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/LetterlikeSymbols.js",
          "type": "blob",
          "size": 5960,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/294279fa939b4c83d2d01d8f69b4c840a91384a2"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/Main.js",
          "type": "blob",
          "size": 73098,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/0f79b7043fb4c92ef69c930d438fdfa7f7136ff3"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/MathOperators.js",
          "type": "blob",
          "size": 887,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a840002268ad4722ca0dc5e8d1de15781f84f093"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/MiscSymbols.js",
          "type": "blob",
          "size": 4513,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/0ee3f8c6c9e5a1388a38dc050443e7e991bfe0a3"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/SpacingModLetters.js",
          "type": "blob",
          "size": 1170,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a738f01918a9e654a4b9fd4dc53c6f579c6fe8ff"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Main/Regular/SuppMathOperators.js",
          "type": "blob",
          "size": 1477,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/dd18513d53b3b414cd0a20d27d213343ef025515"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Math",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/c5622aebec3b07795b568f4a64ebbd2042db867d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Math/BoldItalic",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/71fa44035e538d699de4df15ab246c016ca80b5e"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Math/BoldItalic/Main.js",
          "type": "blob",
          "size": 58684,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9e32b4bb9708362c0b2c703cb9a57c62b4960608"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Math/Italic",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/7596b7b2db9d8ad6c3b0dc055712c3d3de7df601"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Math/Italic/Main.js",
          "type": "blob",
          "size": 58935,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/af0198ac5a3447e79fa33cff2bf617fdb183d2b9"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/de00947f033fdb55d1141683bdee01430019d321"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Bold",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/fbb09fa5d19a288db56fe4d86c10e53f74493029"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Bold/BasicLatin.js",
          "type": "blob",
          "size": 36852,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f0a5a45cd6835258da80653009da8d569297e9c4"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Bold/CombDiacritMarks.js",
          "type": "blob",
          "size": 4011,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/af3774e57868dbab1b4524002384f0fc37eec2f2"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Bold/Main.js",
          "type": "blob",
          "size": 997,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/44af36e97313754e6dcc4b13facc26ca3355de69"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Bold/Other.js",
          "type": "blob",
          "size": 8151,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/09c0fc3445cef6fb444b3e568d0f139a64fdc861"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Italic",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/eeca21293f122f9784b8ace675792a71bfbf245d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Italic/BasicLatin.js",
          "type": "blob",
          "size": 30362,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1c14cd596f60fbd0abdebf46ae3920ff0d6bc597"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Italic/CombDiacritMarks.js",
          "type": "blob",
          "size": 2694,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/433f5020926578809ccfc1419ee3f7bfd7db5057"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Italic/Main.js",
          "type": "blob",
          "size": 1006,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9ad9f3669bd1fc12c390fed7df34df0c92986fce"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Italic/Other.js",
          "type": "blob",
          "size": 6428,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/123f5678ddf6898033cbd67a4f0f0a10667d51af"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/80070818b4b889cfa9967f261a5157caeee848a5"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Regular/BasicLatin.js",
          "type": "blob",
          "size": 24036,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/914cd8a696ccbbf41ce9c2d4dece03bcedbdf1f1"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Regular/CombDiacritMarks.js",
          "type": "blob",
          "size": 2547,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fd7edaee60da20fbe7dcf0cf1b8fbd3ce77a339b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Regular/Main.js",
          "type": "blob",
          "size": 983,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/712a58582686fd327d80c6330ea5942be9a97c7b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/SansSerif/Regular/Other.js",
          "type": "blob",
          "size": 4559,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/bfda683d8d4223b7ea9d1d9295b7c110c22d665b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Script",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/8d9960a2bf17030ac1a104aea1591ae98d429641"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Script/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/ed4b8892b0570728a8608548c01ee429d04e36be"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Script/Regular/BasicLatin.js",
          "type": "blob",
          "size": 28343,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/25053a97ab65e78d484164e599fb59739b25d527"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Script/Regular/Main.js",
          "type": "blob",
          "size": 1158,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/62f12e6689d4574afcdbea3c3a127829eea9fb9b"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size1",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/ea4120ff6120b316021282344a5dd906f92fd419"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size1/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/12649c27a5a348805f5cdbd89e9dfc48726060bd"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size1/Regular/Main.js",
          "type": "blob",
          "size": 17011,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/955ef22f40c7ff6ce4357c1c81f3558d1fb1e10c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size2",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/088f87c1bb2f4aeac360338c79b0e3df1cc33b3d"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size2/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/de1b95fd0178d8a3eeaaf5509b8591fecebe3651"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size2/Regular/Main.js",
          "type": "blob",
          "size": 15579,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/03170432c1d5a3d734e2175a423aeb2ec82949d0"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size3",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/ca481cb6c7820601e3f104918802f00cd0ed656f"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size3/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/d2f9cb5e50630661bfa21ed2073fe62b2c7bf32c"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size3/Regular/Main.js",
          "type": "blob",
          "size": 5608,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ea807b86ca93fc417656415e2705d032e0363ec2"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size4",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/10832061105f7419c69c8bc5ee6dcda18e59c841"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size4/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/950c1435d0f79f6d7c7d6614a918ecebded0c6b2"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Size4/Regular/Main.js",
          "type": "blob",
          "size": 11670,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fad1e0fbbd77da70d089dc25083981813b51bbba"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Typewriter",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/13ab63739279ab3708d7d4bfd1f1705a34ea7b94"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Typewriter/Regular",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/bd5a377ef356010e62b0b2f660b5aa6ff7476ecb"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Typewriter/Regular/BasicLatin.js",
          "type": "blob",
          "size": 43719,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8adcd722bbbb84851450d82a992b2011e63c07ce"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Typewriter/Regular/CombDiacritMarks.js",
          "type": "blob",
          "size": 3345,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6e4e7bfa21f1c7e7add2d85cedb58c5f55091400"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Typewriter/Regular/Main.js",
          "type": "blob",
          "size": 988,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/33f03ac6ad4ee45def3c7b4ae8229f43711e1cbc"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/Typewriter/Regular/Other.js",
          "type": "blob",
          "size": 8476,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1d1de865a59933c6912a0ef8cee916980fc6c9f5"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/fontdata-extra.js",
          "type": "blob",
          "size": 4210,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/96437c24a116139e95e5982ef8f69fd9e795fcb3"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/fonts/TeX/fontdata.js",
          "type": "blob",
          "size": 143577,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d3dc01535f893113a6c885a8a7c008b61a7377ec"
        },
        {
          "path": "src/main/resources/static/scripts/external/MathJax/jax/output/SVG/jax.js",
          "type": "blob",
          "size": 53388,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9981fbe97daec8762312b799bd09684ce6d87241"
        },
        {
          "path": "src/main/resources/static/scripts/external/async-2.5.0.min.js",
          "type": "blob",
          "size": 23742,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/29893ed86df55ddded75e492648894424e13d5cb"
        },
        {
          "path": "src/main/resources/static/scripts/external/async.min.map",
          "type": "blob",
          "size": 40747,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/08ab9348dd3212ab9926ed09336d15bbc34d07a6"
        },
        {
          "path": "src/main/resources/static/scripts/external/bootstrap-3.3.7.min.js",
          "type": "blob",
          "size": 37045,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9bcd2fccaed9442f1460191d6670ca5e8e08520c"
        },
        {
          "path": "src/main/resources/static/scripts/external/canvas2image.js",
          "type": "blob",
          "size": 4791,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/977bb5f2171930594983c01699434bfd59a07c3a"
        },
        {
          "path": "src/main/resources/static/scripts/external/colorpicker.js",
          "type": "blob",
          "size": 17227,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/bfb603b8dae4551194bfacf9690c7d016ebd2cad"
        },
        {
          "path": "src/main/resources/static/scripts/external/fingerprint2-1.5.1.min.js",
          "type": "blob",
          "size": 34377,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f6750fcd3bc64809ded5ef144c4bec487fc69fbe"
        },
        {
          "path": "src/main/resources/static/scripts/external/html2canvas.js",
          "type": "blob",
          "size": 126139,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/43fc7a594f2cc669a9b7d58aca849bb2335936ba"
        },
        {
          "path": "src/main/resources/static/scripts/external/jquery-3.1.1.min.js",
          "type": "blob",
          "size": 86709,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4c5be4c0fbe230e81d95718a18829e965a2d14b2"
        },
        {
          "path": "src/main/resources/static/scripts/external/jquery-ui-1.12.1.min.js",
          "type": "blob",
          "size": 253668,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/48ce1a3ee8a42b44a439951a6d6cb2f276806308"
        },
        {
          "path": "src/main/resources/static/scripts/external/jspdf_1_3_3.min.js",
          "type": "blob",
          "size": 237555,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a3b1656ad5fe8238a844a9016ce4ffb11342aa97"
        },
        {
          "path": "src/main/resources/static/scripts/external/logger.js",
          "type": "blob",
          "size": 19091,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/0e9782e7fb2179bfbb10bb48e8b6d10d88ea725d"
        },
        {
          "path": "src/main/resources/static/scripts/external/plotly-1.30.1.min.js",
          "type": "blob",
          "size": 2297554,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/82aea61348d215002db77ec6dedca6510a27ce9c"
        },
        {
          "path": "src/main/resources/static/scripts/external/waiting_dialog.js",
          "type": "blob",
          "size": 3366,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/5ba9374659fd3daefd8db362199870f5f9e2561c"
        },
        {
          "path": "src/main/resources/static/scripts/ganalytics.js",
          "type": "blob",
          "size": 1397,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/09ef19fefb2e2a4aab3f8208045a956888afd640"
        },
        {
          "path": "src/main/resources/static/scripts/historyManager.js",
          "type": "blob",
          "size": 1207,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4f0200f4c87096a2964d668908bab6915a78e47d"
        },
        {
          "path": "src/main/resources/static/scripts/htmlControls.js",
          "type": "blob",
          "size": 7976,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/59b44f15bf7fbb39dfcb57ad040a0dff081a6e6a"
        },
        {
          "path": "src/main/resources/static/scripts/infoPanel.js",
          "type": "blob",
          "size": 3783,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fa7b31957e66f6644cbe3a03d5db40e7f3ec7834"
        },
        {
          "path": "src/main/resources/static/scripts/master_page.js",
          "type": "blob",
          "size": 8658,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f75674b2e5594af6a7f64cd40b0206cda19e4157"
        },
        {
          "path": "src/main/resources/static/scripts/outputPanels",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/4f5822a670f845ca19ea2b59f8f680ca04dd717d"
        },
        {
          "path": "src/main/resources/static/scripts/outputPanels/outputPanel.js",
          "type": "blob",
          "size": 4104,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e01621a01f42757db22892b82b1df6867887a19a"
        },
        {
          "path": "src/main/resources/static/scripts/outputPanels/wfOutputPanel.js",
          "type": "blob",
          "size": 36209,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1d16be0895bdb979e67c54212f9064a90f4b7336"
        },
        {
          "path": "src/main/resources/static/scripts/plots",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/e5a095174b0e1de8d08ae95117ba040f1accf592"
        },
        {
          "path": "src/main/resources/static/scripts/plots/agnPlot.js",
          "type": "blob",
          "size": 8432,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2c50b18a3e3092b7e7181e407301de5cb8ba7f1c"
        },
        {
          "path": "src/main/resources/static/scripts/plots/confidencePlot.js",
          "type": "blob",
          "size": 1722,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/786eb3b091bdb23c6cc1d5f2c06eca3683b99cdf"
        },
        {
          "path": "src/main/resources/static/scripts/plots/covariancePlot.js",
          "type": "blob",
          "size": 3357,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/db02d804d6f171b0418e818bceba71209ea9281f"
        },
        {
          "path": "src/main/resources/static/scripts/plots/dynSpPlot.js",
          "type": "blob",
          "size": 14737,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d8a866ccee3def3c12a438558d6af210f454acba"
        },
        {
          "path": "src/main/resources/static/scripts/plots/fitPlot.js",
          "type": "blob",
          "size": 9780,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/42cc073e365f85f28616210005deadfa75537c46"
        },
        {
          "path": "src/main/resources/static/scripts/plots/freqRangePlot.js",
          "type": "blob",
          "size": 3813,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e5fa532f16372a0a8a332f7f8e84e1e344853fe9"
        },
        {
          "path": "src/main/resources/static/scripts/plots/lcPlot.js",
          "type": "blob",
          "size": 13886,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3322c1b0a6fff7c29b1d3d517d4434d80ebcbf21"
        },
        {
          "path": "src/main/resources/static/scripts/plots/pdsPlot.js",
          "type": "blob",
          "size": 18392,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a67db2e6b8516abc1b4c179936c72fb23e539a7c"
        },
        {
          "path": "src/main/resources/static/scripts/plots/pgPlot.js",
          "type": "blob",
          "size": 2037,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2213d74f5c15c7bcc2eb8c6681a389991c88e670"
        },
        {
          "path": "src/main/resources/static/scripts/plots/phPlot.js",
          "type": "blob",
          "size": 11386,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1efe62dab7a5b0075b42b7b6d53200566ec25e9a"
        },
        {
          "path": "src/main/resources/static/scripts/plots/phaseLagPlot.js",
          "type": "blob",
          "size": 492,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/744b46e5cb032cedf942f6c69a6acf7080241761"
        },
        {
          "path": "src/main/resources/static/scripts/plots/plot.js",
          "type": "blob",
          "size": 61550,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3e7b2dea3303c6087439dd0ee3a7687ed57cddee"
        },
        {
          "path": "src/main/resources/static/scripts/plots/plotWithSettings.js",
          "type": "blob",
          "size": 17103,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/36c597b97f945793485a61dfbb6af09e9e3fd9cc"
        },
        {
          "path": "src/main/resources/static/scripts/plots/plotter.js",
          "type": "blob",
          "size": 14363,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4a255a02f1a3493f1899b7463f4142587cc3c64f"
        },
        {
          "path": "src/main/resources/static/scripts/plots/profilePlot.js",
          "type": "blob",
          "size": 1396,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/508045c7ee4e451de3510a6138e10fdf478aad15"
        },
        {
          "path": "src/main/resources/static/scripts/plots/pulseSearchPlot.js",
          "type": "blob",
          "size": 2819,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/99e1fa9b8f492ce5fc6b2f97fbac95ec0a85721c"
        },
        {
          "path": "src/main/resources/static/scripts/plots/rmsPlot.js",
          "type": "blob",
          "size": 4193,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/993e4c0a2b5ca9f344e10babee0ea4b8299b0dc9"
        },
        {
          "path": "src/main/resources/static/scripts/plots/timingPlot.js",
          "type": "blob",
          "size": 2036,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ce5082a7d253bff67cbb07c4b554e5b1ac89d360"
        },
        {
          "path": "src/main/resources/static/scripts/projectConfig.js",
          "type": "blob",
          "size": 7130,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/df6a109681f6adf594a05e3ef8ce73003c422ed0"
        },
        {
          "path": "src/main/resources/static/scripts/schema.js",
          "type": "blob",
          "size": 6819,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b56bfb5e42f9edd587c959d8b93fab37ac0c3aae"
        },
        {
          "path": "src/main/resources/static/scripts/selectors",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/6eded7eb8d5994bd1cd026ea22cd783f3cd72733"
        },
        {
          "path": "src/main/resources/static/scripts/selectors/binSelector.js",
          "type": "blob",
          "size": 7690,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1768cd1d53f7a39534ce4a3b891fa7c666c69f57"
        },
        {
          "path": "src/main/resources/static/scripts/selectors/fileSelector.js",
          "type": "blob",
          "size": 8346,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d68619b8f24628e333b6d522c49dd749b9e98763"
        },
        {
          "path": "src/main/resources/static/scripts/selectors/modelSelector.js",
          "type": "blob",
          "size": 24832,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fdc8154a01f7cb39eaef6689336f822f0fa5e2f1"
        },
        {
          "path": "src/main/resources/static/scripts/selectors/sliderSelector.js",
          "type": "blob",
          "size": 10970,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8ff8a33fdd1f40b03e7fce3a1db4e4998f25326d"
        },
        {
          "path": "src/main/resources/static/scripts/service.js",
          "type": "blob",
          "size": 6456,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/0a0e8cf7eb04f9b9559cf3647a95ab134b62d157"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/270272f15be38ddbef26cbdb79570ec592c81c76"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/agnTabpanel.js",
          "type": "blob",
          "size": 14794,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2c4fc2b7bea130aec01726eb5d800be6e0d9fbd6"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/fitTabpanel.js",
          "type": "blob",
          "size": 27303,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/73af8080aac1f704a3f63428ce07ce3fe6b483f3"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/pgTabpanel.js",
          "type": "blob",
          "size": 8918,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d49fc04cb7d802f0f4ddae4c0df38919f31edc38"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/phTabpanel.js",
          "type": "blob",
          "size": 38450,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9e0e739f4cda6f2babb958f4f957ef4c18b3ef21"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/settingsTabpanel.js",
          "type": "blob",
          "size": 12990,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/19ea55cd4f70e8cf90423139b38b963325e2cd90"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/tabpanel.js",
          "type": "blob",
          "size": 6032,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8d2082b83d5afcdf4927ffef482348801949e6dc"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/wfTabpanel.js",
          "type": "blob",
          "size": 39847,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/af29471e5b6f54c0484e10b3924855e79ade5608"
        },
        {
          "path": "src/main/resources/static/scripts/tabPanels/xsTabpanel.js",
          "type": "blob",
          "size": 10181,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cca309bfdfdcb3fd31682ef0e1edd9b30cea8d19"
        },
        {
          "path": "src/main/resources/static/scripts/toolpanel.js",
          "type": "blob",
          "size": 55363,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3524a4727f610fdbdffb1aad2a937b08b4f0a9a2"
        },
        {
          "path": "src/main/resources/static/scripts/version.js",
          "type": "blob",
          "size": 29,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4ad1e84681709506365fbe287d412338bddb9b68"
        },
        {
          "path": "src/main/resources/static/styles",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/e426080f7f50ecafdaf6dd0940ae51765aa8eddd"
        },
        {
          "path": "src/main/resources/static/styles/external",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/bb7c9def01b340d329d817fc7764ae45d952b2a9"
        },
        {
          "path": "src/main/resources/static/styles/external/bootstrap-3.3.7.min.css",
          "type": "blob",
          "size": 121200,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ed3905e0e0c91d4ed7d8aa14412dffeb038745ff"
        },
        {
          "path": "src/main/resources/static/styles/external/bootstrap-theme-3.3.7.min.css",
          "type": "blob",
          "size": 23409,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/5e39401957d87d5d810f3d05ab05aca5febd7b5d"
        },
        {
          "path": "src/main/resources/static/styles/external/bootstrap-theme.min.css.map",
          "type": "blob",
          "size": 25648,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/94813e9006074c2ce411b02c4014be94b5bb6039"
        },
        {
          "path": "src/main/resources/static/styles/external/bootstrap.min.css.map",
          "type": "blob",
          "size": 542194,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6c7fa40b98db056a6d36faf96c77ef85d4a68bba"
        },
        {
          "path": "src/main/resources/static/styles/external/colorpicker.css",
          "type": "blob",
          "size": 3163,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/24ba4b8e68104aaed956e95e51d5b0fc1a802571"
        },
        {
          "path": "src/main/resources/static/styles/external/images",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/8582973f7729381cfcbc5bd2f28ce734f587ec95"
        },
        {
          "path": "src/main/resources/static/styles/external/images/blank.gif",
          "type": "blob",
          "size": 49,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/75b945d2553848b8b6f41fe5e24599c0687b8472"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_background.png",
          "type": "blob",
          "size": 1897,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8401572f1939a1a24c1963513573b0194ad36ee0"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_hex.png",
          "type": "blob",
          "size": 532,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4e532d7c65393fe56d7463e1da3faa591f03de84"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_hsb_b.png",
          "type": "blob",
          "size": 970,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/dfac595d017e279ff670df2c816e02d922660d9f"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_hsb_h.png",
          "type": "blob",
          "size": 1012,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3977ed9f21e3186eefd37b198a7cc3f8de6c69cb"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_hsb_s.png",
          "type": "blob",
          "size": 1171,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a2a699736c24b34c60afac8cea399b2c4afcf9a1"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_indic.gif",
          "type": "blob",
          "size": 86,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f9fa95e2825eadd2d779ad270a71eddb94f94748"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_overlay.png",
          "type": "blob",
          "size": 10355,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/561cdd9c59a498b499cbfd1295dc4d2037e235ff"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_rgb_b.png",
          "type": "blob",
          "size": 970,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/dfac595d017e279ff670df2c816e02d922660d9f"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_rgb_g.png",
          "type": "blob",
          "size": 1069,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/72b32760a5c40b7ab834d176ac588750a06f13f2"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_rgb_r.png",
          "type": "blob",
          "size": 1066,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/4855fe03f8ea8d88b4f8ae625c7958eea65208ac"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_select.gif",
          "type": "blob",
          "size": 78,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/599f7f13a6854d198f501588948ffcf97bf9f365"
        },
        {
          "path": "src/main/resources/static/styles/external/images/colorpicker_submit.png",
          "type": "blob",
          "size": 984,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/7f4c0825f53cc4faba8fc9e043502276765da1f5"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_background.png",
          "type": "blob",
          "size": 1916,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cf55ffdd68ed42f2d70bd7ec2010cee86c110816"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_hex.png",
          "type": "blob",
          "size": 562,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/888f444495b3e08dbfa91181bf94d90bf48c85c8"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_hsb_b.png",
          "type": "blob",
          "size": 1097,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2f99dae8e6ef73e91a5d6283d2a732b6372d5e27"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_hsb_h.png",
          "type": "blob",
          "size": 970,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a217e9218e6a512b507a35e8a6141f0e56193439"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_hsb_s.png",
          "type": "blob",
          "size": 1168,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/7826b415077be23ed1b1bf05b2da62d4aa5b1c67"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_indic.gif",
          "type": "blob",
          "size": 86,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/222fb94cfd66bd2bd525891024289d8ee7adc321"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_rgb_b.png",
          "type": "blob",
          "size": 1008,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/80764e5d6dd8aac3c5ef87d83b45d29780af1fe9"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_rgb_g.png",
          "type": "blob",
          "size": 1069,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fc9778be1eb862a7ada05ae4a34726df0a2c73af"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_rgb_r.png",
          "type": "blob",
          "size": 1018,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/91b0cd4c520013444ae3a64c7e10b28060992557"
        },
        {
          "path": "src/main/resources/static/styles/external/images/custom_submit.png",
          "type": "blob",
          "size": 997,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cd202cd93b753b31926593e79eb3756cd58bd677"
        },
        {
          "path": "src/main/resources/static/styles/external/images/select.png",
          "type": "blob",
          "size": 506,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/21213bfd51b088497f3a9e423170cd65532d873d"
        },
        {
          "path": "src/main/resources/static/styles/external/images/select2.png",
          "type": "blob",
          "size": 518,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2cd2cabeb6777c724034d5b0e0efd664011f515c"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-bg_flat_0_aaaaaa_40x100.png",
          "type": "blob",
          "size": 86,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a2e6bfc085f51b392569e58b72d454586b900f61"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-icons_444444_256x240.png",
          "type": "blob",
          "size": 3266,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/df4e37378517044e8d109e5682b0d411d2eff92e"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-icons_555555_256x240.png",
          "type": "blob",
          "size": 3274,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/bbb422fed19271590726760a02a4b251d7143cad"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-icons_777620_256x240.png",
          "type": "blob",
          "size": 3262,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ee49e9e501496827b5d632892a15f87535455af8"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-icons_777777_256x240.png",
          "type": "blob",
          "size": 3266,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b01ff3deebd1fca16da650534e7e44abbe72cbf5"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-icons_cc0000_256x240.png",
          "type": "blob",
          "size": 3262,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8920193948f0642fb2e4e722b702bae4e26bfaf4"
        },
        {
          "path": "src/main/resources/static/styles/external/images/ui-icons_ffffff_256x240.png",
          "type": "blob",
          "size": 3264,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/1cba4313d3b931df8231fd958084bb9dc27e31bd"
        },
        {
          "path": "src/main/resources/static/styles/external/jquery-ui-1.12.1.min.css",
          "type": "blob",
          "size": 30747,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a647364bf18e299ba6d95bf17218201ba66760cd"
        },
        {
          "path": "src/main/resources/static/styles/external/sb-admin-theme.css",
          "type": "blob",
          "size": 3485,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f821920ba5ee7da6c7ad94a557f6f86ad708b9cd"
        },
        {
          "path": "src/main/resources/static/styles/master_page.css",
          "type": "blob",
          "size": 12244,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/8e9d83e183f585ec8ddbedbdddc5eb6bd323d05e"
        },
        {
          "path": "src/main/resources/templates",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/175e0637d05f448cab6bba756c2a2b64a0b4f00b"
        },
        {
          "path": "src/main/resources/templates/error.html",
          "type": "blob",
          "size": 342,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2edac2fa8a02a97abf7ca77981e570337f46537d"
        },
        {
          "path": "src/main/resources/templates/includes",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/88fff2821f5a1ae1cae00ef84309bbfa0ed7f9c8"
        },
        {
          "path": "src/main/resources/templates/includes/nav_bar.html",
          "type": "blob",
          "size": 1357,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9df8764dfb23277be2713f409514bb1885da81a6"
        },
        {
          "path": "src/main/resources/templates/includes/output_panel.html",
          "type": "blob",
          "size": 3556,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ae74fa33d89316291e50f165d60a2f0f5559ecb7"
        },
        {
          "path": "src/main/resources/templates/includes/tab_panel.html",
          "type": "blob",
          "size": 2245,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e688f2573e4bc83457f26e4359d8cdad6ae0749e"
        },
        {
          "path": "src/main/resources/templates/includes/tool_panel.html",
          "type": "blob",
          "size": 2751,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/567b58d3b1e6438a311e489e89961e97b9ab07ee"
        },
        {
          "path": "src/main/resources/templates/master_page.html",
          "type": "blob",
          "size": 4346,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6930809d2a448bdc6c407a01269264b82f4038cb"
        },
        {
          "path": "src/main/resources/templates/splash_page.html",
          "type": "blob",
          "size": 5144,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/9fd6bb8c894df23de7f939740dc60e4bfae6ec56"
        },
        {
          "path": "src/test",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/df2feeace46741d3d1f2562d5564c63aab395290"
        },
        {
          "path": "src/test/python",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/d647db7f7a9f84bfc71de07953190adac5ee4147"
        },
        {
          "path": "src/test/python/test",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/d954cdac07d6fff37d8b86c1f0eed75ffd1e0d93"
        },
        {
          "path": "src/test/python/test/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "src/test/python/test/fixture.py",
          "type": "blob",
          "size": 360,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/74bc82bf772cf78db8a6d39d168416b4ef944b1f"
        },
        {
          "path": "src/test/python/test/model",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/3f1172dce8d1b2891931378441e7cd21096120e9"
        },
        {
          "path": "src/test/python/test/model/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "src/test/python/test/model/test_column.py",
          "type": "blob",
          "size": 1647,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/a73f2654867c470300e2e9e3176ab0b9b5b5ecf8"
        },
        {
          "path": "src/test/python/test/model/test_dataset.py",
          "type": "blob",
          "size": 4836,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d6c390ba13bce74ac8a31d82a11b48a65e2d24a1"
        },
        {
          "path": "src/test/python/test/model/test_table.py",
          "type": "blob",
          "size": 3589,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/930af8c04c029f3ff1cb1a2a7351d66a7c2b87c5"
        },
        {
          "path": "src/test/python/test/utils",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/12c4f448290569af5b98c0bb99f7f432a380284d"
        },
        {
          "path": "src/test/python/test/utils/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "src/test/python/test/utils/test_dataset_helper.py",
          "type": "blob",
          "size": 790,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/28239035af5361a11b5029fa8502b640baac33e7"
        },
        {
          "path": "src/test/python/test/utils/test_dave_engine.py",
          "type": "blob",
          "size": 2935,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/bcb1e3de30ab7db3cbd340c03e6b19c1b95aabb4"
        },
        {
          "path": "src/test/python/test/utils/test_dave_reader.py",
          "type": "blob",
          "size": 4412,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/d63ed7c2354e60490d4cc47254d4d80f19652900"
        },
        {
          "path": "src/test/python/test/utils/test_file_utils.py",
          "type": "blob",
          "size": 514,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2f3343f64d8a907eca1738fdf2b50791ddb54529"
        },
        {
          "path": "src/test/python/test/utils/test_filters_helper.py",
          "type": "blob",
          "size": 1390,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/069ff53365253c8d15947c5c014c7eff27166afb"
        },
        {
          "path": "src/test/resources",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/5e6f5eeaaa31b48923a1f60fbadd58e12a93921e"
        },
        {
          "path": "src/test/resources/datasets",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/e0ad13c0f313b363213748d05afac74177d1f1df"
        },
        {
          "path": "src/test/resources/datasets/Input1.txt",
          "type": "blob",
          "size": 2160,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/870fb7cc7bbd2db296262e20101df37235e4e8e5"
        },
        {
          "path": "src/test/resources/datasets/Input2.txt",
          "type": "blob",
          "size": 204120,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b39f3820dfda18391b89cbfa840b6e9b7ce835af"
        },
        {
          "path": "src/test/resources/datasets/Input3.txt",
          "type": "blob",
          "size": 204120,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b39f3820dfda18391b89cbfa840b6e9b7ce835af"
        },
        {
          "path": "src/test/resources/datasets/Input_funnycolor.txt",
          "type": "blob",
          "size": 3447,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/3f0d0691934e01dd22ea843fe9568adceaa174f9"
        },
        {
          "path": "src/test/resources/datasets/Input_funnycolor_selectcolor.txt",
          "type": "blob",
          "size": 928,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/933344458e7f0e62e6f95618376b0e1c0281bbda"
        },
        {
          "path": "src/test/resources/datasets/Input_funnycolor_selecttime.txt",
          "type": "blob",
          "size": 1229,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/372ed97239c3ce0380a48ef03ad82f9e15c44554"
        },
        {
          "path": "src/test/resources/datasets/Input_reorderedcolor.txt",
          "type": "blob",
          "size": 3447,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/2a4192807892b58b6d08f1fa5a915df62ce2da95"
        },
        {
          "path": "src/test/resources/datasets/Input_withcolor.txt",
          "type": "blob",
          "size": 2505,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/ead07b0326d60f99b92f8f28b8a01ff2f4524ee0"
        },
        {
          "path": "src/test/resources/datasets/PN_source_lightcurve_raw.lc",
          "type": "blob",
          "size": 198720,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/56c507d3a3d5cc8c2eccf1f7d5b5aa99176b495e"
        },
        {
          "path": "src/test/resources/datasets/bulk_example.txt",
          "type": "blob",
          "size": 308,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c7839cab6ce9dd213c59373e815784f5bc6c1fea"
        },
        {
          "path": "src/test/resources/datasets/gen_colordata.py",
          "type": "blob",
          "size": 379,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/b3acbfa2c47b453f62e7abb2dfce9d2b19ef3936"
        },
        {
          "path": "src/test/resources/datasets/in.txt",
          "type": "blob",
          "size": 1200,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/f5c4039494128199e707b1a44374467db83c5542"
        },
        {
          "path": "src/test/resources/datasets/std1_ao9_01_01.lc",
          "type": "blob",
          "size": 357120,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/633cec3b61d242d3acdd3321b2a878b9a44809f2"
        },
        {
          "path": "src/test/resources/datasets/std2_ao9_01_00.lc",
          "type": "blob",
          "size": 43200,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/058f20e601e93070e85f248317d94627087a6a0c"
        },
        {
          "path": "src/test/resources/datasets/test.evt",
          "type": "blob",
          "size": 28800,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/89245be2b94246983581b43c15359a7b9b373eb7"
        },
        {
          "path": "src/test/resources/images",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/6fa7727638654ad1a2b0abc1e126c63dff2615fe"
        },
        {
          "path": "src/test/resources/images/testimage1.jpg",
          "type": "blob",
          "size": 48399,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/52f448743acab4f0bd58ee0a205cef5c1e656bef"
        },
        {
          "path": "src/test/resources/images/testimage1.png",
          "type": "blob",
          "size": 48399,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/52f448743acab4f0bd58ee0a205cef5c1e656bef"
        },
        {
          "path": "src/test/resources/images/testimage2.png",
          "type": "blob",
          "size": 48399,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/52f448743acab4f0bd58ee0a205cef5c1e656bef"
        },
        {
          "path": "src/test/resources/notebooks",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/edbae62ce776ccf2118a3aecd052ced47effffb1"
        },
        {
          "path": "src/test/resources/notebooks/GenColorData.ipynb",
          "type": "blob",
          "size": 19218,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/fa9efc68cb8cc36b4dce97498c59e4dffa13e079"
        },
        {
          "path": "src/test/resources/pytest",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/f75331c0eeeec163e7c2632cb6925db2c6352b12"
        },
        {
          "path": "src/test/resources/pytest/PN_source_lightcurve_raw.lc",
          "type": "blob",
          "size": 198720,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/56c507d3a3d5cc8c2eccf1f7d5b5aa99176b495e"
        },
        {
          "path": "src/test/resources/pytest/Test_Input_1.txt",
          "type": "blob",
          "size": 580,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c58739773d78bdeb77c4055f20f400829cc4f4ae"
        },
        {
          "path": "src/test/resources/pytest/Test_Input_2.lc",
          "type": "blob",
          "size": 357120,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/56b70974a303fab7924da71c5260abe4afb84f4c"
        },
        {
          "path": "src/test/resources/pytest/test.evt",
          "type": "blob",
          "size": 31680,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/e989a7a189c68c5525f76f8bc71cf97ab489159e"
        },
        {
          "path": "src/test/resources/pytest/test_Gtis.evt",
          "type": "blob",
          "size": 31680,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/5cdbc79448b03f04e2d74b4673c001b4c3913cd7"
        },
        {
          "path": "src/test/resources/python_examples",
          "type": "tree",
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/trees/0210ce239459cae987a832945f5155a07cb8dc97"
        },
        {
          "path": "src/test/resources/python_examples/3D.py",
          "type": "blob",
          "size": 1285,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/6a41379a71f016af7b784edd31cb37115866ed93"
        },
        {
          "path": "src/test/resources/python_examples/load.py",
          "type": "blob",
          "size": 865,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/c8e326cc0c7724cb91c8867c0863e97174269d86"
        },
        {
          "path": "src/test/resources/python_examples/test1.py",
          "type": "blob",
          "size": 719,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/cbef143a5d0188aca51a3223bfe301e9f556b565"
        },
        {
          "path": "src/test/resources/python_examples/test2.py",
          "type": "blob",
          "size": 777,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/99b06225a669b3ed5a6bd0017c6d16e3e66d7ae3"
        },
        {
          "path": "src/test/resources/python_examples/testing_fits.py",
          "type": "blob",
          "size": 195,
          "url": "https://api.github.com/repos/StingraySoftware/dave/git/blobs/dcdf73ec2c9d78fe62709a27f8cebd007889e841"
        }
      ],
      "githubIssues": {
        "total": 5,
        "open": 0,
        "closed": 0
      },
      "githubPullRequests": {
        "total": 15,
        "open": 5,
        "closed": 0,
        "merged": 10
      }
    },
    "latestRelease": {
      "version": "v1.0",
      "name": "First stable release",
      "publishedAt": "2017-12-31T13:40:05.000Z",
      "description": "This is the first release that has a complete set of functionalities for time-series analysis of astronomical objects.",
      "htmlUrl": "https://github.com/StingraySoftware/dave/releases/tag/v1.0",
      "downloadCount": 38
    },
    "branches": [
      {
        "name": "DAVE_with_netCDF4",
        "commitSha": "465ecd3642857885c5cb3cd4afbf523d9cfe85c1"
      },
      {
        "name": "DAVE_363_NodeVersion",
        "commitSha": "8567e4fe390b9e2e6044e0a026b6260a24d8ca60"
      },
      {
        "name": "fix_port_and_enable_debugging",
        "commitSha": "185b5b2175ae07b0b9085622756c4528237e4c64"
      },
      {
        "name": "fix_wrong_names",
        "commitSha": "282a3488dbd7efab24659e749440b29af87d080b"
      },
      {
        "name": "fixLibMagicInstallation",
        "commitSha": "9b70273268d735ea520d1469e874b84a67a22cb4"
      },
      {
        "name": "hendricseverywhere",
        "commitSha": "69c544e970b9931c22421f3ca61dc0337c2c7a2e"
      },
      {
        "name": "master",
        "protected": true,
        "commitSha": "e7188025763cb3a2840aef0e1dd15b52be8de9a1"
      },
      {
        "name": "solve_hang",
        "commitSha": "64c8e71c8e8e97115caab0d3f947766c9c468394"
      },
      {
        "name": "update_install",
        "commitSha": "8b6f31b704e2bdfc5bbd7e01c3a3a73dee2f8d49"
      },
      {
        "name": "upgrades-security",
        "commitSha": "bf61d5eac472be4a756a3522c038bb0426df38aa"
      }
    ],
    "lastGitHubSync": "2025-09-09T06:12:14.283Z",
    "meta": {
      "title": "DAVE",
      "description": "\nA GUI for spectral-timing analysis of X-ray astronomical data.",
      "image": {
        "id": 12,
        "alt": "DAVE",
        "caption": null,
        "updatedAt": "2025-07-14T06:37:49.998Z",
        "createdAt": "2025-07-14T06:37:45.925Z",
        "url": "/media/DAVE.png",
        "thumbnailURL": "/media/DAVE-300x162.png",
        "filename": "DAVE.png",
        "mimeType": "image/png",
        "filesize": 1425570,
        "width": 2770,
        "height": 1492,
        "focalX": 50,
        "focalY": 50,
        "sizes": {
          "thumbnail": {
            "url": "/media/DAVE-300x162.png",
            "width": 300,
            "height": 162,
            "mimeType": "image/png",
            "filesize": 54088,
            "filename": "DAVE-300x162.png"
          },
          "square": {
            "url": "/media/DAVE-500x500.png",
            "width": 500,
            "height": 500,
            "mimeType": "image/png",
            "filesize": 136484,
            "filename": "DAVE-500x500.png"
          },
          "small": {
            "url": "/media/DAVE-600x323.png",
            "width": 600,
            "height": 323,
            "mimeType": "image/png",
            "filesize": 167273,
            "filename": "DAVE-600x323.png"
          },
          "medium": {
            "url": "/media/DAVE-900x485.png",
            "width": 900,
            "height": 485,
            "mimeType": "image/png",
            "filesize": 314615,
            "filename": "DAVE-900x485.png"
          },
          "large": {
            "url": "/media/DAVE-1400x754.png",
            "width": 1400,
            "height": 754,
            "mimeType": "image/png",
            "filesize": 604697,
            "filename": "DAVE-1400x754.png"
          },
          "xlarge": {
            "url": "/media/DAVE-1920x1034.png",
            "width": 1920,
            "height": 1034,
            "mimeType": "image/png",
            "filesize": 966134,
            "filename": "DAVE-1920x1034.png"
          },
          "og": {
            "url": "/media/DAVE-1200x630.png",
            "width": 1200,
            "height": 630,
            "mimeType": "image/png",
            "filesize": 471153,
            "filename": "DAVE-1200x630.png"
          }
        }
      }
    }
  },
  {
    "id": 17,
    "displayOrder": 10,
    "title": "RRIVis",
    "shortDescription": "Full-RIME radio interferometric visibility simulator with 8 Jones matrix terms, full polarization, and NumPy/JAX backends for CPU and GPU/TPU.",
    "description": "No assumptions visibility simulator",
    "category": "scientific-computing",
    "projectStatus": "active",
    "slug": "rrivis",
    "publishedAt": "2025-07-14T07:15:49.886Z",
    "updatedAt": "2025-10-16T13:44:39.644Z",
    "createdAt": "2025-07-14T07:15:06.552Z",
    "coverImage": {
      "id": 21,
      "alt": "RRIVis Poster",
      "caption": null,
      "updatedAt": "2025-10-16T13:44:37.637Z",
      "createdAt": "2025-10-16T13:44:36.852Z",
      "url": "/media/rrivis_poster.png",
      "thumbnailURL": "/media/rrivis_poster-300x345.png",
      "filename": "rrivis_poster.png",
      "mimeType": "image/png",
      "filesize": 346873,
      "width": 629,
      "height": 724,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/rrivis_poster-300x345.png",
          "width": 300,
          "height": 345,
          "mimeType": "image/png",
          "filesize": 95228,
          "filename": "rrivis_poster-300x345.png"
        },
        "square": {
          "url": "/media/rrivis_poster-500x500.png",
          "width": 500,
          "height": 500,
          "mimeType": "image/png",
          "filesize": 199888,
          "filename": "rrivis_poster-500x500.png"
        },
        "small": {
          "url": "/media/rrivis_poster-600x691.png",
          "width": 600,
          "height": 691,
          "mimeType": "image/png",
          "filesize": 301185,
          "filename": "rrivis_poster-600x691.png"
        },
        "medium": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "large": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "xlarge": {
          "url": null,
          "width": null,
          "height": null,
          "mimeType": null,
          "filesize": null,
          "filename": null
        },
        "og": {
          "url": "/media/rrivis_poster-1200x630.png",
          "width": 1200,
          "height": 630,
          "mimeType": "image/png",
          "filesize": 562244,
          "filename": "rrivis_poster-1200x630.png"
        }
      }
    },
    "techStack": [
      {
        "technology": "Jupyter Notebook"
      },
      {
        "technology": "Python"
      },
      {
        "technology": "HTML"
      }
    ],
    "links": {
      "githubUrl": "https://github.com/RRI-interferometry/RRIVis",
      "githubStats": {
        "stars": 0,
        "forks": 0,
        "watchers": 0,
        "openIssues": 0,
        "language": "Jupyter Notebook",
        "size": 50085,
        "lastUpdated": "2025-01-07T10:59:17.000Z"
      }
    },
    "projectDetails": {
      "linesOfCode": 2891,
      "totalCommits": 52,
      "fileCount": 44,
      "directoryCount": 4,
      "repositorySize": 50085,
      "defaultBranch": "main",
      "isArchived": false,
      "isFork": false,
      "createdAt": "2024-08-06T05:21:57.000Z",
      "contributors": [
        {
          "name": "kartikmandar",
          "contributions": 52,
          "githubUrl": "https://github.com/kartikmandar",
          "avatarUrl": "https://avatars.githubusercontent.com/u/92812266?v=4"
        }
      ],
      "fileTree": [
        {
          "path": ".gitattributes",
          "type": "blob",
          "size": 171,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/3807f0f289db3b09b62c0b0e8f9b8653a4c499fb"
        },
        {
          "path": ".gitignore",
          "type": "blob",
          "size": 206,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/1a98f1f6153cef3184e3fe220599a00cd9bc5ed8"
        },
        {
          "path": "CHIME.ipynb",
          "type": "blob",
          "size": 129,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/69167a81847644273fe8dd52921c59e451e056a9"
        },
        {
          "path": "LOFAR.ipynb",
          "type": "blob",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "RRIviz.ipynb",
          "type": "blob",
          "size": 1551432,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/e6632285a45d50d0cdfea41355cd77f323c0f011"
        },
        {
          "path": "RRIviz",
          "type": "tree",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/trees/9ccea8b4fb914d9f58ad18e3c58bfbbc74261dd1"
        },
        {
          "path": "RRIviz/LICENSE",
          "type": "blob",
          "size": 1071,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/4b95162d22850b72ba0cf7926ecb6e009665d12f"
        },
        {
          "path": "RRIviz/README.md",
          "type": "blob",
          "size": 3999,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/bc896c434f1b3687e21cdc48e5f54c08fd7fcc2f"
        },
        {
          "path": "RRIviz/data",
          "type": "tree",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/trees/3bb7fc793c39e8777552bf135c50e6642fc708fa"
        },
        {
          "path": "RRIviz/data/HERA65_layout.csv",
          "type": "blob",
          "size": 3763,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/1914366e9b261d93e7ea00a25d200d39989d30d8"
        },
        {
          "path": "RRIviz/data/NF_HERA_Vivaldi_efield_beam_healpix.fits",
          "type": "blob",
          "size": 134,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/a5ca4b977791cf412ad58d7e173151d2c5fae288"
        },
        {
          "path": "RRIviz/data/antenna.txt",
          "type": "blob",
          "size": 456,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/cee548296ff739cd3655350e68ba980e00621e34"
        },
        {
          "path": "RRIviz/requirements.txt",
          "type": "blob",
          "size": 25,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/2e5ff00fca29f3f07fd0c5eadc2a2038223383cf"
        },
        {
          "path": "RRIviz/setup.py",
          "type": "blob",
          "size": 370,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/c0f836b8f5500e87af95e9950a16bffadb95538b"
        },
        {
          "path": "RRIviz/src",
          "type": "tree",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/trees/2ab381fc74779d9c394978c911e4cb72d336d090"
        },
        {
          "path": "RRIviz/src/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "RRIviz/src/antenna.py",
          "type": "blob",
          "size": 2546,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/bba387129384b5607214a86e5003109afc7dc068"
        },
        {
          "path": "RRIviz/src/baseline.py",
          "type": "blob",
          "size": 1422,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/971a272ebbf3aee79e323548fa1f381d59d0583c"
        },
        {
          "path": "RRIviz/src/beams.py",
          "type": "blob",
          "size": 424,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/b1f1b83ac605f9fab4392ba98a38a5355bcca80b"
        },
        {
          "path": "RRIviz/src/config.yaml",
          "type": "blob",
          "size": 413,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/5ccbe39b4f819cf8671d2a2a12062c562886f979"
        },
        {
          "path": "RRIviz/src/fits.py",
          "type": "blob",
          "size": 899,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/4cfd9ef8f9fe8ec67cccabf2701df2d1b7f8dfad"
        },
        {
          "path": "RRIviz/src/gsm_map.py",
          "type": "blob",
          "size": 8424,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/81a44dbc63b772f398caf398350582dbe57591da"
        },
        {
          "path": "RRIviz/src/main.html",
          "type": "blob",
          "size": 134,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/84989a03220d0616bb2ca310dbc0c9f7d78ffd4d"
        },
        {
          "path": "RRIviz/src/main.py",
          "type": "blob",
          "size": 23398,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/656565a204316178ee4a9bf76e7e8cc9fbba048e"
        },
        {
          "path": "RRIviz/src/observation.py",
          "type": "blob",
          "size": 1495,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/3f71a3221073732df069e92a52f20ce751240f3e"
        },
        {
          "path": "RRIviz/src/plot.py",
          "type": "blob",
          "size": 28889,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/852eb7c05fde5394dbc5ddfd07338cd05774fd48"
        },
        {
          "path": "RRIviz/src/reading.py",
          "type": "blob",
          "size": 2048,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/c852b61180863b63bb660540376140c129e4225b"
        },
        {
          "path": "RRIviz/src/skymodel.py",
          "type": "blob",
          "size": 5054,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/6f6470b8ef98c04886fff956b649d368f7b7066b"
        },
        {
          "path": "RRIviz/src/source.py",
          "type": "blob",
          "size": 6921,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/19dbca6ed3442e51e80cd6b6628aa593109d3f0d"
        },
        {
          "path": "RRIviz/src/visibility.py",
          "type": "blob",
          "size": 11702,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/9ead980ca2adfc1063e57d5b1aaa9ebcdd87e4f7"
        },
        {
          "path": "RRIviz/src/visibility_results.json",
          "type": "blob",
          "size": 290765,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/8f76a841629891e7ff909a52bf1693f1031e06a8"
        },
        {
          "path": "RRIviz/tests",
          "type": "tree",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/trees/2223306e5a10384f770a65e530a9b1be52a43a6f"
        },
        {
          "path": "RRIviz/tests/__init__.py",
          "type": "blob",
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
        },
        {
          "path": "RRIviz/tests/conftest.py",
          "type": "blob",
          "size": 474,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/7273ba29897686b304477a894cb0b12ff8eb75f5"
        },
        {
          "path": "RRIviz/tests/test_antenna.py",
          "type": "blob",
          "size": 3083,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/d0efec0af28451b1096022d59711e3f3bdf37ac7"
        },
        {
          "path": "RRIviz/tests/test_baseline.py",
          "type": "blob",
          "size": 2752,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/7a7fd4fc4b3f33f6ff5bfc5b00651963c07dfd5d"
        },
        {
          "path": "RRIviz/tests/test_main.py",
          "type": "blob",
          "size": 249,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/d9e206330312a95ad406081487b7dec8fe27b42d"
        },
        {
          "path": "RRIviz/tests/test_observation.py",
          "type": "blob",
          "size": 856,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/4294d696000850cb52e862b17067559a7925809a"
        },
        {
          "path": "RRIviz/tests/test_plot.py",
          "type": "blob",
          "size": 1657,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/2624fedffc634e9f4c0cf6df199d7d18fb010628"
        },
        {
          "path": "RRIviz/tests/test_visibility.py",
          "type": "blob",
          "size": 4872,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/52f5dfa05c6911b4460d162c826a63880210c1f2"
        },
        {
          "path": "environment-minimal.yml",
          "type": "blob",
          "size": 320,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/929291db8202150221ae77c542461bfb0fe95a09"
        },
        {
          "path": "environment.yml",
          "type": "blob",
          "size": 8941,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/2554423b09b3fd595b9f2e494f232864e6e15fea"
        },
        {
          "path": "fftvis.ipynb",
          "type": "blob",
          "size": 483,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/2892e98ba282f465c8467ee6cd2ef3167c0c0e55"
        },
        {
          "path": "galactic.ipynb",
          "type": "blob",
          "size": 131,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/48863378ae8f1de18a28be0f9a8469d754383306"
        },
        {
          "path": "healpix_map.fits",
          "type": "blob",
          "size": 132,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/3d3b9d7b95805a3bed162fc89c0876482a7f59a3"
        },
        {
          "path": "matvis.ipynb",
          "type": "blob",
          "size": 131,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/2f22bc0a7d1e3cbeecb02aedd83f96819cfb7fba"
        },
        {
          "path": "skymap.ipynb",
          "type": "blob",
          "size": 131,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/22724c24b3c410ee9f7ef51e9c35d09bf7e57edc"
        },
        {
          "path": "var-mail.txt",
          "type": "blob",
          "size": 46317,
          "url": "https://api.github.com/repos/RRI-interferometry/HERA/git/blobs/a150645e8299f30408d928e3f5fb2639174e515e"
        }
      ],
      "githubIssues": {
        "total": 0,
        "open": 0,
        "closed": 0
      },
      "githubPullRequests": {
        "total": 0,
        "open": 0,
        "closed": 0,
        "merged": 0
      }
    },
    "branches": [
      {
        "name": "healpix",
        "commitSha": "fccc12974014b2239955d5b4d6d4e45706dc2f36"
      },
      {
        "name": "main",
        "commitSha": "ce772ca60690739f0f4704c263b6e7ba3cb17f7e"
      }
    ],
    "lastGitHubSync": "2025-09-09T06:12:13.224Z"
  }
] as Project[]

/**
 * Get all projects, sorted by displayOrder then newest first.
 */
export function getProjects(): Project[] {
  return [...projects].sort((a, b) => {
    const orderA = a.displayOrder ?? 999
    const orderB = b.displayOrder ?? 999
    if (orderA !== orderB) return orderA - orderB
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })
}

/**
 * Get only published projects.
 */
export function getPublishedProjects(): Project[] {
  return getProjects()
}

/**
 * Get a single project by slug.
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}
