import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Common Resources in Astronomy and Astrophysics | Comprehensive Guide',
    description: 'A comprehensive compendium of astronomy and astrophysics resources including books, equipment, software, citizen science projects, and educational content for astronomers at all levels.',
    openGraph: {
      title: 'Common Resources in Astronomy and Astrophysics',
      description: 'Everything you need to explore the universe, from inspiring books and documentaries to professional software and cutting-edge equipment.',
    },
  }
}

interface ResourceItem {
  title: string;
  description: string;
  url: string;
  type: string;
}

interface Subcategory {
  name: string;
  items: ResourceItem[];
}

interface Category {
  category: string;
  subcategories?: Subcategory[];
  items?: ResourceItem[];
}

export default async function Page() {
  const resources: Category[] = [
    {
      category: 'Essential Books & Literature',
      subcategories: [
        {
          name: 'Popular Science Books',
          items: [
            {
              title: 'Cosmos by Carl Sagan',
              description: 'Landmark book exploring the universe with eloquent prose and philosophical depth',
              url: 'https://www.amazon.com/Cosmos-Carl-Sagan/dp/0345331354',
              type: 'Book'
            },
            {
              title: 'A Brief History of Time by Stephen Hawking',
              description: 'Accessible guide to cosmology, black holes, and the nature of time',
              url: 'https://www.amazon.com/Brief-History-Time-Stephen-Hawking/dp/0553380168',
              type: 'Book'
            },
            {
              title: 'Astrophysics for People in a Hurry by Neil deGrasse Tyson',
              description: 'Concise overview of the universe and astrophysical concepts',
              url: 'https://www.amazon.com/Astrophysics-People-Hurry-deGrasse-Tyson/dp/0393609391',
              type: 'Book'
            },
            {
              title: 'The Elegant Universe by Brian Greene',
              description: 'Making string theory and fundamental physics accessible',
              url: 'https://www.amazon.com/Elegant-Universe-Superstrings-Dimensions-Ultimate/dp/039333810X',
              type: 'Book'
            },
            {
              title: 'The First Three Minutes by Steven Weinberg',
              description: 'Classic introduction to cosmology and the early universe',
              url: 'https://www.amazon.com/First-Three-Minutes-Modern-Universe/dp/0465024378',
              type: 'Book'
            },
            {
              title: 'Pale Blue Dot by Carl Sagan',
              description: 'Sagan\'s exploration of our place in the cosmos and future of space exploration',
              url: 'https://www.amazon.com/Pale-Blue-Dot-Vision-Future/dp/0345376595',
              type: 'Book'
            },
            {
              title: 'Death by Black Hole by Neil deGrasse Tyson',
              description: 'Engaging explanations of astrophysical phenomena and cosmic quandaries',
              url: 'https://www.amazon.com/Death-Black-Hole-Cosmic-Quandaries/dp/0393330168',
              type: 'Book'
            },
            {
              title: 'The Fabric of the Cosmos by Brian Greene',
              description: 'Exploration of space, time, and the texture of reality',
              url: 'https://www.amazon.com/Fabric-Cosmos-Space-Texture-Reality/dp/0375727205',
              type: 'Book'
            },
            {
              title: 'Hyperspace by Michio Kaku',
              description: 'Journey through higher dimensions and parallel universes',
              url: 'https://www.amazon.com/Hyperspace-Scientific-Parallel-Universes-Dimension/dp/0385477058',
              type: 'Book'
            },
            {
              title: 'A Short History of Nearly Everything by Bill Bryson',
              description: 'Entertaining overview of science including astronomical discoveries',
              url: 'https://www.amazon.com/Short-History-Nearly-Everything/dp/076790818X',
              type: 'Book'
            },
            {
              title: 'Welcome to the Universe by Tyson, Strauss & Gott',
              description: 'Astrophysical tour from Earth to the edge of the universe',
              url: 'https://www.amazon.com/Welcome-Universe-Astrophysical-Neil-deGrasse/dp/069115724X',
              type: 'Book'
            },
            {
              title: 'A Universe from Nothing by Lawrence Krauss',
              description: 'Cosmological perspective on the origin of the universe',
              url: 'https://www.amazon.com/Universe-Nothing-There-Something-Rather/dp/1451624468',
              type: 'Book'
            },
            {
              title: 'Big Bang by Simon Singh',
              description: 'Accessible introduction to cosmology and the Big Bang theory',
              url: 'https://www.amazon.com/Big-Bang-Origin-Universe-Simon/dp/0007162219',
              type: 'Book'
            },
            {
              title: 'Einstein\'s Cosmos by Michio Kaku',
              description: 'Exploration of Einstein\'s contributions to cosmology and physics',
              url: 'https://www.amazon.com/Einsteins-Cosmos-Science-Become-Reality/dp/0393327000',
              type: 'Book'
            },
            {
              title: 'Parallel Worlds by Michio Kaku',
              description: 'Journey through cosmology and parallel universe theories',
              url: 'https://www.amazon.com/Parallel-Worlds-Creation-Higher-Dimensions/dp/1400033721',
              type: 'Book'
            },
            {
              title: 'The Theory of Everything by Stephen Hawking',
              description: 'Hawking\'s exploration of fundamental physics and cosmology',
              url: 'https://www.amazon.com/Theory-Everything-Origin-Universe/dp/1893224791',
              type: 'Book'
            },
            {
              title: 'The Universe in a Nutshell by Stephen Hawking',
              description: 'Follow-up to Brief History exploring physics with characteristic wit',
              url: 'https://www.amazon.com/Universe-Nutshell-Stephen-Hawking/dp/055380202X',
              type: 'Book'
            },
            {
              title: 'The Grand Design by Stephen Hawking',
              description: 'Latest insights into the nature of the universe and reality',
              url: 'https://www.amazon.com/Grand-Design-Stephen-Hawking/dp/055338466X',
              type: 'Book'
            },
            {
              title: 'Letters From An Astrophysicist by Neil deGrasse Tyson',
              description: 'Personal correspondence offering unique astrophysical perspectives',
              url: 'https://www.amazon.com/Letters-Astrophysicist-Neil-deGrasse-Tyson/dp/0393608980',
              type: 'Book'
            },
            {
              title: 'Origins: Fourteen Billion Years of Cosmic Evolution',
              description: 'Tyson\'s comprehensive look at cosmic history and evolution',
              url: 'https://www.amazon.com/Origins-Fourteen-Billion-Cosmic-Evolution/dp/0393350398',
              type: 'Book'
            }
          ]
        },
        {
          name: 'Undergraduate Textbooks',
          items: [
            {
              title: 'An Introduction to Modern Astrophysics by Carroll & Ostlie',
              description: 'Comprehensive undergraduate textbook covering all aspects of astrophysics',
              url: 'https://www.amazon.com/Introduction-Modern-Astrophysics-Bradley-Carroll/dp/1108422160',
              type: 'Textbook'
            },
            {
              title: 'Essential Astrophysics by Kenneth R. Lang',
              description: 'Astrophysics from basic principles for one-semester overview',
              url: 'https://www.amazon.com/Essential-Astrophysics-Undergraduate-Lecture-Physics/dp/3642359620',
              type: 'Textbook'
            },
            {
              title: 'Astrophysics in a Nutshell by Dan Maoz',
              description: 'Concise yet thorough textbook praised for clarity and modern approach',
              url: 'https://www.amazon.com/Astrophysics-Nutshell-Dan-Maoz/dp/0691164797',
              type: 'Textbook'
            },
            {
              title: 'Principles of Astrophysics by Charles Keeton',
              description: 'Fundamental principles textbook for undergraduate study',
              url: 'https://www.amazon.com/Principles-Astrophysics-Charles-Keeton/dp/1461487986',
              type: 'Textbook'
            },
            {
              title: 'Astrophysical Concepts by Martin Harwit',
              description: 'Conceptual approach to astrophysics for undergraduate courses',
              url: 'https://www.amazon.com/Astrophysical-Concepts-Astronomy-Astrophysics-Library/dp/0387949437',
              type: 'Textbook'
            },
            {
              title: 'Astrophysics for Physicists by Arnab Rai Choudhuri',
              description: 'Physics-focused approach emphasizing underlying physical principles',
              url: 'https://www.amazon.com/Astrophysics-Physicists-Arnab-Rai-Choudhuri/dp/0521825563',
              type: 'Textbook'
            },
            {
              title: 'Astronomy - A Beginner\'s Guide to the Universe by Chaisson & McMillan',
              description: 'Structured introduction suitable for newcomers to astronomy',
              url: 'https://www.amazon.com/Astronomy-Beginners-Guide-Universe-Chaisson/dp/0321815351',
              type: 'Textbook'
            },
            {
              title: 'Narlikar\'s Introduction to Cosmology',
              description: 'Cosmology text praised for beautiful writing style',
              url: 'https://www.amazon.com/Introduction-Cosmology-Jayant-Narlikar/dp/0521793769',
              type: 'Textbook'
            }
          ]
        },
        {
          name: 'Advanced & Graduate Textbooks',
          items: [
            {
              title: 'General Relativity, Astrophysics & Cosmology by Raychaudhuri',
              description: 'Mathematical treatment of cosmology with rigorous mathematics',
              url: 'https://www.amazon.com/General-Relativity-Astrophysics-Cosmology-A-K/dp/8181472845',
              type: 'Advanced Textbook'
            },
            {
              title: 'Cosmology by Steven Weinberg',
              description: 'Advanced, thorough treatment of modern cosmology',
              url: 'https://www.amazon.com/Cosmology-Steven-Weinberg/dp/0198526822',
              type: 'Advanced Textbook'
            },
            {
              title: 'Road to Reality by Roger Penrose',
              description: 'Epic 1000+ page exploration of mathematical physics and cosmology',
              url: 'https://www.amazon.com/Road-Reality-Complete-Guide-Universe/dp/0679776311',
              type: 'Advanced Book'
            },
            {
              title: 'A General Relativity Coursebook by Ed Daw',
              description: 'Coursebook for advanced study of general relativity',
              url: 'https://www.amazon.com/General-Relativity-Coursebook-Ed-Daw/dp/1107615453',
              type: 'Advanced Textbook'
            },
            {
              title: 'General Relativity and Relativistic Astrophysics by Straumann',
              description: 'Extremely mathematical treatment with astrophysics applications',
              url: 'https://www.amazon.com/General-Relativity-Relativistic-Astrophysics-Straumann/dp/3540130772',
              type: 'Advanced Textbook'
            }
          ]
        },
        {
          name: 'Specialized & Planetary Science',
          items: [
            {
              title: 'Theory of Stellar Atmospheres by Hubeny & Mihalas',
              description: 'Key text for astrophysical non-equilibrium quantitative spectroscopic analysis',
              url: 'https://press.princeton.edu/books/hardcover/9780691163291/theory-of-stellar-atmospheres',
              type: 'Specialized Textbook'
            },
            {
              title: 'Planetary Sciences by de Pater & Lissauer',
              description: 'Comprehensive interdisciplinary approach to planetary science',
              url: 'https://www.amazon.com/Planetary-Sciences-Imke-Pater/dp/1107091985',
              type: 'Textbook'
            },
            {
              title: 'Atmospheric Evolution on Inhabited & Lifeless Worlds by Catling',
              description: 'Evolution of planetary atmospheres and habitability',
              url: 'https://www.amazon.com/Atmospheric-Evolution-Inhabited-Lifeless-Worlds/dp/0521844266',
              type: 'Specialized Book'
            },
            {
              title: 'How to Find a Habitable Planet by James Kasting',
              description: 'Search for Earth-like worlds and conditions for life',
              url: 'https://www.amazon.com/How-Find-Habitable-Planet-Science/dp/0691138052',
              type: 'Book'
            },
            {
              title: 'The Planet Factory by Elizabeth Tasker',
              description: 'Exoplanets and the search for a second Earth',
              url: 'https://www.amazon.com/Planet-Factory-Exoplanets-Search-Second/dp/1632866307',
              type: 'Book'
            },
            {
              title: 'Physics and Chemistry of the Solar System by John S. Lewis',
              description: 'Comprehensive planetary science textbook',
              url: 'https://www.amazon.com/Physics-Chemistry-Solar-System-Lewis/dp/0124467849',
              type: 'Textbook'
            },
            {
              title: 'Planetary Climates by Andrew P. Ingersoll',
              description: 'Atmospheric dynamics and climate systems of planets',
              url: 'https://www.amazon.com/Planetary-Climates-Andrew-P-Ingersoll/dp/0691169470',
              type: 'Specialized Book'
            }
          ]
        },
        {
          name: 'Physics & Scientific Inspiration',
          items: [
            {
              title: 'For the Love of Physics by Walter Lewin',
              description: 'Insights into the process and joy of scientific discovery',
              url: 'https://www.amazon.com/Love-Physics-End-Rainbow/dp/1451605234',
              type: 'Book'
            },
            {
              title: 'The Pleasure of Finding Things Out by Richard Feynman',
              description: 'Joy of scientific discovery and the process of physics',
              url: 'https://www.amazon.com/Pleasure-Finding-Things-Out-Richard/dp/0465023959',
              type: 'Book'
            },
            {
              title: 'The Feynman Lectures on Physics',
              description: 'Classic physics lectures highly recommended for serious physics study',
              url: 'https://www.feynmanlectures.caltech.edu/',
              type: 'Classic Textbook'
            },
            {
              title: 'QED: The Strange Theory of Light and Matter by Feynman',
              description: 'Accessible introduction to quantum electrodynamics',
              url: 'https://www.amazon.com/QED-Strange-Theory-Light-Matter/dp/0691164096',
              type: 'Book'
            },
            {
              title: 'Relativity: Special and General Theory by A. Einstein',
              description: 'The original source offering profound insights into spacetime',
              url: 'https://www.amazon.com/Relativity-Special-General-Theory-Einstein/dp/1607965224',
              type: 'Classic Text'
            }
          ]
        },
        {
          name: 'Amateur Astronomy & Observing',
          items: [
            {
              title: 'The Backyard Astronomer\'s Guide by Dickinson & Dyer',
              description: 'Practical guide for amateur observers with equipment advice',
              url: 'https://www.amazon.com/Backyard-Astronomers-Guide-Terence-Dickinson/dp/1554073448',
              type: 'Book'
            },
            {
              title: 'Amateur Telescope Making (Volumes 1-3) by Ingalls',
              description: 'Classic collection covering vast range of ATM topics',
              url: 'https://www.amazon.com/Amateur-Telescope-Making-Book-One/dp/0943396131',
              type: 'ATM Classic'
            }
          ]
        }
      ]
    },
    {
      category: 'Software & Data Analysis',
      subcategories: [
        {
          name: 'Planetarium & Sky Simulation',
          items: [
            {
              title: 'Stellarium',
              description: 'Free planetarium software showing realistic 3D sky with star catalogs',
              url: 'https://stellarium.org/',
              type: 'Software'
            },
            {
              title: 'KStars',
              description: 'Free cross-platform astronomy software with EKOS imaging suite',
              url: 'https://edu.kde.org/kstars/',
              type: 'Software'
            },
            {
              title: 'Cartes du Ciel (SkyChart)',
              description: 'Free sky charting software with extensive catalogs and telescope control',
              url: 'https://www.ap-i.net/skychart/',
              type: 'Software'
            },
            {
              title: 'TheSky Astronomy Software',
              description: 'Essential tool for astronomical discovery and telescope control',
              url: 'https://www.bisque.com/',
              type: 'Software'
            },
            {
              title: 'Starry Night',
              description: 'Professional astronomy software for sky simulation and telescope control',
              url: 'https://starrynight.com/',
              type: 'Software'
            },
            {
              title: 'DSO Planner',
              description: 'Observation planning tool with excellent star charting capabilities',
              url: 'https://www.dso-planner.com/',
              type: 'Software'
            }
          ]
        },
        {
          name: 'Astrophotography Processing',
          items: [
            {
              title: 'PixInsight',
              description: 'Professional astrophotography processing platform with advanced tools',
              url: 'https://pixinsight.com/',
              type: 'Software'
            },
            {
              title: 'Siril',
              description: 'Free astronomical image processing tool for complete astrophotography workflow',
              url: 'https://siril.org/',
              type: 'Software'
            },
            {
              title: 'MaxIm DL',
              description: 'Comprehensive astronomical imaging solution for acquisition and processing',
              url: 'https://diffractionlimited.com/product/maxim-dl/',
              type: 'Software'
            }
          ]
        },
        {
          name: 'Python Libraries & Scientific Computing',
          items: [
            {
              title: 'Astropy',
              description: 'Core Python package for astronomy with coordinates, units, and FITS support',
              url: 'https://www.astropy.org/',
              type: 'Python Library'
            },
            {
              title: 'PyEphem',
              description: 'Python package for calculating positions of celestial objects',
              url: 'https://pyephem.readthedocs.io/',
              type: 'Python Library'
            },
            {
              title: 'NumPy',
              description: 'Fundamental package for scientific computing with Python',
              url: 'https://numpy.org/',
              type: 'Python Library'
            },
            {
              title: 'SciPy',
              description: 'Scientific computing library built on NumPy for optimization and statistics',
              url: 'https://scipy.org/',
              type: 'Python Library'
            },
            {
              title: 'Matplotlib',
              description: 'Comprehensive library for creating static, animated, and interactive visualizations',
              url: 'https://matplotlib.org/',
              type: 'Python Library'
            }
          ]
        },
        {
          name: 'Professional Data Reduction',
          items: [
            {
              title: 'IRAF',
              description: 'Image Reduction and Analysis Facility for astronomical data processing',
              url: 'https://iraf-community.github.io/',
              type: 'Software'
            },
            {
              title: 'SExtractor',
              description: 'Builds catalogs of objects from astronomical images (AstrOmatic suite)',
              url: 'https://www.astromatic.net/software/sextractor/',
              type: 'Software'
            },
            {
              title: 'SCAMP',
              description: 'Computes astrometric and photometric solutions for FITS images',
              url: 'https://www.astromatic.net/software/scamp/',
              type: 'Software'
            },
            {
              title: 'Swarp',
              description: 'Resamples and co-adds FITS images for survey processing',
              url: 'https://www.astromatic.net/software/swarp/',
              type: 'Software'
            },
            {
              title: 'PSFEx (PSF Extractor)',
              description: 'Models the Point Spread Function (PSF) of astronomical images',
              url: 'https://www.astromatic.net/software/psfex/',
              type: 'Software'
            },
            {
              title: 'ESO-MIDAS',
              description: 'European Southern Observatory data analysis system for Unix/Linux',
              url: 'https://www.eso.org/sci/software/esomidas/',
              type: 'Software'
            },
            {
              title: 'Common Pipeline Library (CPL)',
              description: 'ESO toolkit for creating automated astronomical data-reduction tasks',
              url: 'https://www.eso.org/sci/software/cpl/',
              type: 'Software'
            },
            {
              title: 'MaNGA Data Reduction Pipeline',
              description: 'Specialized pipeline for MaNGA survey data processing',
              url: 'https://www.sdss.org/dr15/manga/manga-pipeline/',
              type: 'Pipeline'
            }
          ]
        },
        {
          name: 'Mobile Apps & Utilities',
          items: [
            {
              title: 'SkySafari',
              description: 'Professional astronomy app for telescope control and sky identification',
              url: 'https://skysafariastronomy.com/',
              type: 'Mobile App'
            },
            {
              title: 'Celestron StarSense Explorer',
              description: 'Smartphone app using plate-solving for telescope guidance',
              url: 'https://www.celestron.com/pages/starsense-explorer-dx',
              type: 'Mobile App'
            },
            {
              title: 'Polar Scope Align Pro',
              description: 'App to assist with polar alignment of equatorial mounts',
              url: 'https://apps.apple.com/app/polar-scope-align-pro/id1063082267',
              type: 'Mobile App'
            },
            {
              title: 'Polar Clock',
              description: 'Mobile app for polar alignment assistance',
              url: 'https://apps.apple.com/app/polar-clock/id1459027479',
              type: 'Mobile App'
            }
          ]
        },
        {
          name: 'System Tools & Development Environment',
          items: [
            {
              title: 'Cygwin',
              description: 'Windows compatibility layer for running Unix-based astronomical programs',
              url: 'https://www.cygwin.com/',
              type: 'Compatibility Layer'
            },
            {
              title: 'Homebrew',
              description: 'Package manager for macOS to install astronomical software',
              url: 'https://brew.sh/',
              type: 'Package Manager'
            }
          ]
        },
        {
          name: 'Educational Resources & Guides',
          items: [
            {
              title: 'Numerical Python in Astronomy',
              description: 'Practical guide to astrophysical problem solving with Python',
              url: 'https://www.amazon.com/Numerical-Python-Astronomy-Astrophysics-Astrophysical/dp/3030703460',
              type: 'Educational Resource'
            }
          ]
        }
      ]
    },
    {
      category: 'YouTube Channels & Online Learning',
      subcategories: [
        {
          name: 'Astrophysics & Science Channels',
          items: [
            {
              title: 'PBS Space Time',
              description: 'Rigorous explorations of astrophysics, cosmology, and fundamental physics',
              url: 'https://www.youtube.com/@pbsspacetime',
              type: 'YouTube Channel'
            },
            {
              title: 'Dr. Becky',
              description: 'Astrophysicist from Oxford explaining how scientific knowledge is acquired',
              url: 'https://www.youtube.com/@DrBecky',
              type: 'YouTube Channel'
            },
            {
              title: 'Anton Petrov',
              description: 'Daily updates on space discoveries and astronomical phenomena',
              url: 'https://www.youtube.com/@whatdamath',
              type: 'YouTube Channel'
            },
            {
              title: 'SciShow Space',
              description: 'Wide array of topics from early universe to latest space exploration news',
              url: 'https://www.youtube.com/@scishowspace',
              type: 'YouTube Channel'
            },
            {
              title: 'Cool Worlds',
              description: 'Exoplanets, astroengineering, and search for extraterrestrial life',
              url: 'https://www.youtube.com/@CoolWorldsLab',
              type: 'YouTube Channel'
            },
            {
              title: 'Sabine Hossenfelder',
              description: 'Critical discussions on physics, astrophysics, and cosmology without gobbledygook',
              url: 'https://www.youtube.com/@SabineHossenfelder',
              type: 'YouTube Channel'
            }
          ]
        },
        {
          name: 'Space Exploration & Future Tech',
          items: [
            {
              title: 'Isaac Arthur',
              description: 'Futurism, space colonization, megastructures, and Fermi Paradox',
              url: 'https://www.youtube.com/@isaacarthurSFIA',
              type: 'YouTube Channel'
            },
            {
              title: 'Event Horizon (John Michael Godier)',
              description: 'Frontier topics in physics, cosmology, consciousness, and humanity\'s future',
              url: 'https://www.youtube.com/@EventHorizonShow',
              type: 'YouTube Channel'
            },
            {
              title: 'Primal Space',
              description: 'Answers obscure questions about space and spaceflight history',
              url: 'https://www.youtube.com/@PrimalSpace',
              type: 'YouTube Channel'
            },
            {
              title: 'Destiny',
              description: 'Explores Earth\'s mysteries, modern technology, and galactic adventures',
              url: 'https://www.youtube.com/@DestinySpace',
              type: 'YouTube Channel'
            }
          ]
        },
        {
          name: 'Space History & Education',
          items: [
            {
              title: 'The Vintage Space (Amy Shira Teitel)',
              description: 'History of spaceflight with focus on early programs and historical accuracy',
              url: 'https://www.youtube.com/@TheVintageSpace',
              type: 'YouTube Channel'
            }
          ]
        },
        {
          name: 'Formal Lectures & Courses',
          items: [
            {
              title: 'Silicon Valley Astronomy Lectures',
              description: 'Free lectures by noted scientists explaining astronomical developments',
              url: 'https://www.youtube.com/svastronomylectures',
              type: 'Lecture Series'
            },
            {
              title: 'Royal Institution Lectures',
              description: 'Historic Christmas Lectures and Discourses by leading scientists',
              url: 'https://www.youtube.com/@TheRoyalInstitution',
              type: 'Lecture Series'
            },
            {
              title: 'Smithsonian Air & Space Museum Lectures',
              description: 'Best of Space Lectures including JWST and Apollo 8 astronauts',
              url: 'https://www.youtube.com/@airandspace',
              type: 'Lecture Series'
            }
          ]
        },
        {
          name: 'Online Learning Platforms',
          items: [
            {
              title: 'Coursera Astronomy Courses',
              description: 'Online astronomy and astrophysics courses from top universities',
              url: 'https://www.coursera.org/browse/physical-science-and-engineering/physics-and-astronomy',
              type: 'Learning Platform'
            }
          ]
        }
      ]
    },
    {
      category: 'Communities & Forums',
      subcategories: [
        {
          name: 'Online Forums & Discussion',
          items: [
            {
              title: 'Cloudy Nights',
              description: 'Largest amateur astronomy forum for equipment, observing, and astrophotography',
              url: 'https://www.cloudynights.com/',
              type: 'Forum'
            },
            {
              title: 'Astronomy Stack Exchange',
              description: 'Q&A community for astronomy and astrophysics enthusiasts',
              url: 'https://astronomy.stackexchange.com/',
              type: 'Community'
            }
          ]
        },
        {
          name: 'Reddit Communities',
          items: [
            {
              title: 'r/Astronomy',
              description: 'Reddit community for astronomy discussions, news, and questions',
              url: 'https://www.reddit.com/r/Astronomy/',
              type: 'Community'
            },
            {
              title: 'r/astrophotography',
              description: 'Reddit community for amateur astrophotography with strict quality standards',
              url: 'https://www.reddit.com/r/astrophotography/',
              type: 'Community'
            },
            {
              title: 'r/AskAstrophotography',
              description: 'Reddit community for astrophotography equipment and technique questions',
              url: 'https://www.reddit.com/r/AskAstrophotography/',
              type: 'Community'
            },
            {
              title: 'r/telescopes',
              description: 'Community for discussing telescopes, eyepieces, and observing equipment',
              url: 'https://www.reddit.com/r/telescopes/',
              type: 'Community'
            }
          ]
        },
        {
          name: 'Professional Organizations',
          items: [
            {
              title: 'ALPO',
              description: 'Association of Lunar & Planetary Observers for serious solar system observers',
              url: 'https://alpo-astronomy.org/',
              type: 'Organization'
            },
            {
              title: 'Astronomical Society of the Pacific',
              description: 'Educational organization promoting astronomy and space science',
              url: 'https://astrosociety.org/',
              type: 'Organization'
            },
            {
              title: 'Astronomical League',
              description: 'National association of amateur astronomy clubs in the United States',
              url: 'https://www.astroleague.org/',
              type: 'Organization'
            },
            {
              title: 'Night Sky Network',
              description: 'NASA-partnered coalition of amateur astronomy clubs for public outreach',
              url: 'https://nightsky.jpl.nasa.gov/',
              type: 'Network'
            }
          ]
        },
        {
          name: 'Magazines & Blogs',
          items: [
            {
              title: 'Sky & Telescope',
              description: 'Magazine and website with observing guides, news, and expert blogs',
              url: 'https://skyandtelescope.org/',
              type: 'Website'
            },
            {
              title: 'Sky & Telescope Blogs',
              description: 'Expert blogs covering observing tips, space missions, and astrophysics',
              url: 'https://skyandtelescope.org/astronomy-blogs/',
              type: 'Blog Network'
            },
            {
              title: 'Backreaction Blog (Sabine Hossenfelder)',
              description: 'Critical analysis of fundamental physics and scientific trends',
              url: 'https://backreaction.blogspot.com/',
              type: 'Blog'
            }
          ]
        }
      ]
    },
    {
      category: 'Documentaries & Visual Media',
      subcategories: [
        {
          name: 'Science Documentaries',
          items: [
            {
              title: 'Cosmos: A Personal Voyage (1980)',
              description: 'Carl Sagan\'s landmark series with philosophical depth and eloquent narration',
              url: 'https://www.imdb.com/title/tt0081846/',
              type: 'Documentary'
            },
            {
              title: 'Cosmos: A Spacetime Odyssey (2014)',
              description: 'Neil deGrasse Tyson continues Sagan\'s legacy with modern CGI',
              url: 'https://www.imdb.com/title/tt2395695/',
              type: 'Documentary'
            },
            {
              title: 'Cosmos: Possible Worlds (2020)',
              description: 'Third season of Cosmos series exploring cosmic phenomena with updated science',
              url: 'https://www.imdb.com/title/tt11170986/',
              type: 'Documentary Series'
            },
            {
              title: 'How the Universe Works',
              description: 'Extensive series exploring cosmology, astronomy, and physics',
              url: 'https://www.imdb.com/title/tt1832668/',
              type: 'Documentary Series'
            },
            {
              title: 'The Universe',
              description: 'Comprehensive series exploring celestial objects and cosmic events',
              url: 'https://www.imdb.com/title/tt1051155/',
              type: 'Documentary Series'
            },
            {
              title: 'Through the Wormhole',
              description: 'Morgan Freeman explores deep questions about existence and reality',
              url: 'https://www.imdb.com/title/tt1513168/',
              type: 'Documentary Series'
            }
          ]
        },
        {
          name: 'Space Program History',
          items: [
            {
              title: 'Apollo 11 (2019)',
              description: '50th anniversary documentary with high-resolution archival footage',
              url: 'https://www.imdb.com/title/tt8760684/',
              type: 'Documentary'
            },
            {
              title: 'Moon Machines',
              description: 'Detailed technical breakdown of Apollo program vehicles and engineering',
              url: 'https://www.imdb.com/title/tt1030627/',
              type: 'Documentary Series'
            },
            {
              title: 'When We Left Earth: The NASA Missions',
              description: 'Chronicle of NASA\'s crewed space missions from Mercury to Shuttle',
              url: 'https://www.imdb.com/title/tt1223290/',
              type: 'Documentary Series'
            },
            {
              title: 'Mars Inside SpaceX',
              description: 'Documentary on SpaceX\'s Mars exploration plans and activities',
              url: 'https://www.imdb.com/title/tt8760932/',
              type: 'Documentary'
            },
            {
              title: 'It\'s Quieter in the Twilight',
              description: 'Documentary on the team maintaining the aging Voyager spacecraft',
              url: 'https://www.imdb.com/title/tt15097216/',
              type: 'Documentary'
            },
            {
              title: 'Fly Rocket Fly',
              description: 'Story of OTRAG, a private German rocket company from the 1970s',
              url: 'https://www.imdb.com/title/tt7125816/',
              type: 'Documentary'
            },
            {
              title: 'PBS Spaceflight with Martin Sheen',
              description: 'Four-part series on the history of spaceflight',
              url: 'https://www.pbs.org/show/spaceflight/',
              type: 'Documentary Series'
            }
          ]
        },
        {
          name: 'Sci-Fi Films & Hard Science Fiction',
          items: [
            {
              title: 'Interstellar (2014)',
              description: 'Christopher Nolan\'s scientifically grounded space epic',
              url: 'https://www.imdb.com/title/tt0816692/',
              type: 'Film'
            },
            {
              title: 'The Martian (2015)',
              description: 'Astronaut survival story praised for scientific realism',
              url: 'https://www.imdb.com/title/tt3659388/',
              type: 'Film'
            },
            {
              title: 'Contact (1997)',
              description: 'Based on Carl Sagan\'s novel about first contact with aliens',
              url: 'https://www.imdb.com/title/tt0118884/',
              type: 'Film'
            },
            {
              title: '2001: A Space Odyssey (1968)',
              description: 'Kubrick\'s philosophical exploration of human evolution and AI',
              url: 'https://www.imdb.com/title/tt0062622/',
              type: 'Film'
            },
            {
              title: 'Gravity (2013)',
              description: 'Visually stunning film about astronauts surviving orbital accident',
              url: 'https://www.imdb.com/title/tt1454468/',
              type: 'Film'
            },
            {
              title: 'Hidden Figures (2016)',
              description: 'True story of African-American women mathematicians at NASA',
              url: 'https://www.imdb.com/title/tt4846340/',
              type: 'Film'
            },
            {
              title: 'The Right Stuff (1983)',
              description: 'Chronicles early US space program and Mercury Seven astronauts',
              url: 'https://www.imdb.com/title/tt0086197/',
              type: 'Film'
            },
            {
              title: 'Apollo 13 (1995)',
              description: 'True story of ill-fated Apollo 13 lunar mission and rescue',
              url: 'https://www.imdb.com/title/tt0112384/',
              type: 'Film'
            },
            {
              title: 'Ad Astra (2019)',
              description: 'Psychological space drama with hard sci-fi elements',
              url: 'https://www.imdb.com/title/tt2935510/',
              type: 'Film'
            },
            {
              title: 'Moon (2009)',
              description: 'Thoughtful sci-fi exploring identity and isolation on lunar base',
              url: 'https://www.imdb.com/title/tt1182345/',
              type: 'Film'
            },
            {
              title: 'Arrival (2016)',
              description: 'Introspective take on first contact focusing on linguistics and time',
              url: 'https://www.imdb.com/title/tt2543164/',
              type: 'Film'
            },
            {
              title: 'Alien (1979)',
              description: 'Ridley Scott\'s masterpiece fusing sci-fi with horror in deep space',
              url: 'https://www.imdb.com/title/tt0078748/',
              type: 'Film'
            },
            {
              title: 'Dune (2021)',
              description: 'Denis Villeneuve\'s adaptation of Frank Herbert\'s epic sci-fi novel',
              url: 'https://www.imdb.com/title/tt1160419/',
              type: 'Film'
            },
            {
              title: 'Star Wars: A New Hope (1977)',
              description: 'George Lucas\'s space opera that revolutionized sci-fi cinema',
              url: 'https://www.imdb.com/title/tt0076759/',
              type: 'Film'
            },
            {
              title: 'Star Wars: The Empire Strikes Back (1980)',
              description: 'Often considered the high point of the original trilogy',
              url: 'https://www.imdb.com/title/tt0080684/',
              type: 'Film'
            },
            {
              title: 'Star Wars: Return of the Jedi (1983)',
              description: 'Conclusion of the original trilogy that embedded space themes in culture',
              url: 'https://www.imdb.com/title/tt0086190/',
              type: 'Film'
            },
            {
              title: 'Serenity (2005)',
              description: 'Film continuation of the beloved Firefly space western series',
              url: 'https://www.imdb.com/title/tt0379786/',
              type: 'Film'
            }
          ]
        },
        {
          name: 'TV Series',
          items: [
            {
              title: 'The Expanse',
              description: 'Realistic space series with accurate physics and orbital mechanics',
              url: 'https://www.imdb.com/title/tt3952222/',
              type: 'TV Series'
            },
            {
              title: 'Battlestar Galactica (2004-2009)',
              description: 'Critically acclaimed series exploring human themes in fugitive fleet',
              url: 'https://www.imdb.com/title/tt0407362/',
              type: 'TV Series'
            },
            {
              title: 'Babylon 5 (1993-1998)',
              description: 'Long-form story arc exploring interstellar politics and conflict',
              url: 'https://www.imdb.com/title/tt0105946/',
              type: 'TV Series'
            },
            {
              title: 'Firefly (2002)',
              description: 'Beloved space western with unique characters and genre blending',
              url: 'https://www.imdb.com/title/tt0303461/',
              type: 'TV Series'
            }
          ]
        }
      ]
    },
    {
      category: 'Simulators & Interactive Tools',
      subcategories: [
        {
          name: 'Space Simulators',
          items: [
            {
              title: 'SpaceEngine',
              description: 'Photorealistic 3D universe simulator with procedurally generated cosmos',
              url: 'https://spaceengine.org/',
              type: 'Simulator'
            },
            {
              title: 'Celestia',
              description: 'Free 3D space simulator for exploring solar system and beyond',
              url: 'https://celestiaproject.space/',
              type: 'Simulator'
            },
            {
              title: 'Universe Sandbox',
              description: 'Physics-based space simulator for cosmic scale interactions',
              url: 'https://universesandbox.com/',
              type: 'Simulator'
            },
            {
              title: 'Kerbal Space Program',
              description: 'Space flight simulation teaching orbital mechanics and rocket design',
              url: 'https://www.kerbalspaceprogram.com/',
              type: 'Game'
            }
          ]
        },
        {
          name: 'Games & Educational Tools',
          items: [
            {
              title: 'Elite Dangerous',
              description: '1:1 scale Milky Way galaxy simulation based on scientific data',
              url: 'https://www.elitedangerous.com/',
              type: 'Game'
            },
            {
              title: 'No Man\'s Sky',
              description: 'Exploration game with 18 quintillion procedurally generated planets',
              url: 'https://www.nomanssky.com/',
              type: 'Game'
            },
            {
              title: 'Outer Wilds',
              description: 'Time loop mystery game exploring solar system physics',
              url: 'https://www.mobiusdigitalgames.com/outer-wilds.html',
              type: 'Game'
            },
            {
              title: 'Space Engineers',
              description: 'Engineering and construction sandbox in space environments',
              url: 'https://www.spaceengineersgame.com/',
              type: 'Game'
            },
            {
              title: 'Astroneer',
              description: 'Aerospace industry and interplanetary exploration sandbox',
              url: 'https://astroneer.space/',
              type: 'Game'
            },
            {
              title: 'Hardspace: Shipbreaker',
              description: 'Zero-gravity spaceship salvaging with cutting and dismantling',
              url: 'https://www.hardspace-shipbreaker.com/',
              type: 'Game'
            },
            {
              title: 'Mars Horizon',
              description: 'Strategy game managing space agency from dawn of space age to Mars',
              url: 'https://www.mars-horizon.com/',
              type: 'Game'
            },
            {
              title: 'Starfield',
              description: 'Bethesda RPG set in vast galaxy with hundreds of explorable planets',
              url: 'https://bethesda.net/en/game/starfield',
              type: 'Game'
            },
            {
              title: 'NASA Educational Games',
              description: 'Collection including Mars Rover Game, DSN Uplink-Downlink, and Roman Space Observer',
              url: 'https://spaceplace.nasa.gov/menu/play/',
              type: 'Educational Games'
            }
          ]
        }
      ]
    },
    {
      category: 'Astrophotography & Equipment',
      subcategories: [
        {
          name: 'Processing Software',
          items: [
            {
              title: 'DeepSkyStacker',
              description: 'Free software for stacking and processing deep-sky astrophotography',
              url: 'http://deepskystacker.free.fr/',
              type: 'Software'
            },
            {
              title: 'Astro Pixel Processor',
              description: 'Comprehensive astrophotography tool with excellent mosaic capabilities',
              url: 'https://www.astropixelprocessor.com/',
              type: 'Software'
            },
            {
              title: 'Registax',
              description: 'Freeware for planetary astrophotography with wavelet processing',
              url: 'https://www.astronomie.be/registax/',
              type: 'Software'
            },
            {
              title: 'AutoStakkert!',
              description: 'Software for analyzing, aligning, and stacking planetary video frames',
              url: 'https://www.autostakkert.com/',
              type: 'Software'
            },
            {
              title: 'SharpCap',
              description: 'Capture software for high-frame-rate planetary imaging and live stacking',
              url: 'https://www.sharpcap.co.uk/',
              type: 'Software'
            }
          ]
        },
        {
          name: 'AI Tools & Plugins',
          items: [
            {
              title: 'GraXpert',
              description: 'Free standalone application for background gradient suppression with AI noise reduction',
              url: 'https://graxpert.com/',
              type: 'Software'
            },
            {
              title: 'StarNet++',
              description: 'Tool for removing stars from images to process nebulae and galaxies separately',
              url: 'https://www.starnetastro.com/',
              type: 'Software'
            },
            {
              title: 'NoiseXTerminator',
              description: 'AI-powered plugin for noise reduction in astrophotography',
              url: 'https://www.rc-astro.com/resources/NoiseXTerminator/',
              type: 'Plugin'
            },
            {
              title: 'BlurXTerminator',
              description: 'AI-powered deconvolution plugin for sharpening astronomical images',
              url: 'https://www.rc-astro.com/resources/BlurXTerminator/',
              type: 'Plugin'
            },
            {
              title: 'StarXTerminator',
              description: 'AI-powered plugin for star removal and reduction in astrophotos',
              url: 'https://www.rc-astro.com/resources/StarXTerminator/',
              type: 'Plugin'
            },
            {
              title: 'Astronomy Tools Action Set',
              description: 'Popular set of automated Photoshop actions for astrophotography processing',
              url: 'https://www.prodigitalsoftware.com/Astronomy_Tools.html',
              type: 'Plugin'
            }
          ]
        },
        {
          name: 'General Software',
          items: [
            {
              title: 'Adobe Photoshop',
              description: 'General image editing software essential for astrophoto post-processing',
              url: 'https://www.adobe.com/products/photoshop.html',
              type: 'Software'
            },
            {
              title: 'GIMP',
              description: 'Free open-source alternative to Photoshop for astrophoto editing',
              url: 'https://www.gimp.org/',
              type: 'Software'
            },
            {
              title: 'Affinity Photo',
              description: 'Professional image editor with basic astrophotography features and FITS support',
              url: 'https://affinity.serif.com/photo/',
              type: 'Software'
            },
            {
              title: 'AstroBackyard',
              description: 'Astrophotography tutorials, equipment guides, and processing tips',
              url: 'https://astrobackyard.com/',
              type: 'Website'
            },
            {
              title: 'Cloudy Nights Equipment Reviews',
              description: 'Comprehensive telescope and equipment reviews from community',
              url: 'https://www.cloudynights.com/reviews/',
              type: 'Reviews'
            },
            {
              title: 'Telescopius',
              description: 'Free web-based tool for planning astrophotography sessions',
              url: 'https://telescopius.com/',
              type: 'Tool'
            },
            {
              title: 'Astrospheric',
              description: 'Advanced weather forecasting service for North American astronomers',
              url: 'https://astrospheric.com/',
              type: 'Service'
            }
          ]
        }
      ]
    },
    {
      category: 'Research Papers & Academia',
      subcategories: [
        {
          name: 'Preprint Archives & Databases',
          items: [
            {
              title: 'arXiv Astrophysics',
              description: 'Preprint repository for latest research papers in astronomy',
              url: 'https://arxiv.org/list/astro-ph/recent',
              type: 'Repository'
            },
            {
              title: 'NASA ADS',
              description: 'Astrophysics Data System - comprehensive literature database',
              url: 'https://ui.adsabs.harvard.edu/',
              type: 'Database'
            },
            {
              title: 'Google Scholar',
              description: 'Search engine for scholarly literature across disciplines',
              url: 'https://scholar.google.com/',
              type: 'Search Engine'
            },
            {
              title: 'ORCID',
              description: 'Persistent digital identifier for researchers and academics',
              url: 'https://orcid.org/',
              type: 'Service'
            }
          ]
        },
        {
          name: 'Landmark Papers',
          items: [
            {
              title: 'Guth (1981) - Cosmic Inflation',
              description: 'Seminal paper introducing the theory of cosmic inflation',
              url: 'https://doi.org/10.1103/PhysRevD.23.347',
              type: 'Paper'
            },
            {
              title: 'Hawking (1975) - Black Hole Radiation',
              description: 'Foundational paper introducing concept of Hawking radiation',
              url: 'https://doi.org/10.1007/BF02345020',
              type: 'Paper'
            },
            {
              title: 'Smoot et al. (1992) - COBE CMB Anisotropies',
              description: 'Discovery of anisotropies in Cosmic Microwave Background by COBE satellite',
              url: 'https://doi.org/10.1086/186504',
              type: 'Paper'
            },
            {
              title: 'Sachs & Wolfe (1967) - CMB Temperature Variations',
              description: 'Derived Sachs-Wolfe effect linking gravitational potentials to CMB',
              url: 'https://doi.org/10.1086/149008',
              type: 'Paper'
            },
            {
              title: 'Press & Schechter (1974) - Halo Mass Function',
              description: 'Original derivation of dark matter halo mass function',
              url: 'https://doi.org/10.1086/152650',
              type: 'Paper'
            },
            {
              title: 'Riess et al. (1998) - Accelerating Universe',
              description: 'Supernova evidence for cosmic acceleration and dark energy',
              url: 'https://doi.org/10.1086/300499',
              type: 'Paper'
            },
            {
              title: 'Perlmutter et al. (1999) - Cosmic Acceleration',
              description: 'Further supernova evidence for accelerating universe expansion',
              url: 'https://doi.org/10.1086/307221',
              type: 'Paper'
            },
            {
              title: 'Bardeen et al. (1986) - Statistics of Peaks (BBKS)',
              description: 'Comprehensive treatment of Gaussian random fields for structure formation',
              url: 'https://doi.org/10.1086/164143',
              type: 'Paper'
            },
            {
              title: 'Eggen, Lynden-Bell & Sandage (1962) - Galaxy Formation',
              description: 'Early evidence for Milky Way formation via gravitational collapse',
              url: 'https://doi.org/10.1086/147433',
              type: 'Paper'
            },
            {
              title: 'White & Rees (1978) - Galaxy Formation Theory',
              description: 'Two-stage theory for galaxy formation and clustering in dark matter halos',
              url: 'https://doi.org/10.1093/mnras/183.3.341',
              type: 'Paper'
            }
          ]
        },
        {
          name: 'Research Collections',
          items: [
            {
              title: 'Cecilia Payne\'s Thesis (1925)',
              description: 'Legendary thesis proving stars are made of hydrogen and helium',
              url: 'https://www.amnh.org/learn-teach/curriculum-collections/cosmic-horizons-book/cecilia-payne-profile',
              type: 'Thesis'
            },
            {
              title: 'University of Warwick PhD Theses',
              description: 'Modern doctoral research in exoplanets, galaxies, and gravitational waves',
              url: 'https://warwick.ac.uk/fac/sci/physics/research/astro/theses/',
              type: 'Theses'
            },
            {
              title: 'All-Time Top Cited Astrophysics Papers',
              description: 'SLAC database of most influential papers in astrophysics',
              url: 'https://www.slac.stanford.edu/spires/topcites/',
              type: 'Database'
            },
            {
              title: 'Insightful Papers Collection',
              description: 'Curated list of didactic and insightful astrophysics papers',
              url: 'https://wetzel.ucdavis.edu/insightful-papers/',
              type: 'Collection'
            }
          ]
        }
      ]
    },
    {
      category: 'Research Institutions',
      subcategories: [
        {
          name: 'Top Universities',
          items: [
        {
          title: 'MIT - Physics & Astronomy',
          description: 'Leading institution for cosmology research (#1 QS ranking)',
          url: 'https://web.mit.edu/physics/',
          type: 'University'
        },
        {
          title: 'Caltech - Astronomy',
          description: 'Home to JPL and major observatories (#6 QS ranking)',
          url: 'https://pma.caltech.edu/',
          type: 'University'
        },
        {
          title: 'Princeton Astrophysical Sciences',
          description: 'Renowned for comprehensive cosmology programs (#9 QS ranking)',
          url: 'https://web.astro.princeton.edu/',
          type: 'University'
        },
        {
          title: 'UC Berkeley Astronomy',
          description: 'Strong astronomy programs with cosmology research (#7 QS ranking)',
          url: 'https://astro.berkeley.edu/',
          type: 'University'
        },
        {
          title: 'University of Chicago Astronomy',
          description: 'Major center for cosmological research (#11 QS ranking)',
          url: 'https://astro.uchicago.edu/',
          type: 'University'
        },
        {
          title: 'University of Oxford - Physics',
          description: 'Global leader in physics and astronomy (#3 QS ranking)',
          url: 'https://www.physics.ox.ac.uk/',
          type: 'University'
        },
        {
          title: 'University of Cambridge - Astrophysics',
          description: 'World-class cosmology groups and international collaborations (#5 QS ranking)',
          url: 'https://www.ast.cam.ac.uk/',
          type: 'University'
        },
        {
          title: 'Arizona State University - School of Earth and Space Exploration',
          description: 'Interdisciplinary approach to planetary science and astrobiology',
          url: 'https://sese.asu.edu/',
          type: 'University'
        },
        {
          title: 'Brown University - Planetary Geosciences',
          description: 'Strong planetary science program with NASA mission involvement',
          url: 'https://www.brown.edu/academics/earth-environmental-planetary-sciences/',
          type: 'University'
        },
        {
          title: 'Cornell University - Astronomy',
          description: 'Strong planetary science group and space instrumentation',
          url: 'https://astro.cornell.edu/',
          type: 'University'
        },
        {
          title: 'University of Washington - Astrobiology',
          description: 'Earth and Space Sciences with strong astrobiology program',
          url: 'https://www.ess.washington.edu/',
          type: 'University'
        },
        {
          title: 'Yale University - Astronomy',
          description: 'Strong stellar astrophysics programs including exoplanet host stars',
          url: 'https://astronomy.yale.edu/',
          type: 'University'
        },
        {
          title: 'UC Santa Cruz - Astronomy & Astrophysics',
          description: 'Noted for theoretical astrophysics and supernovae research',
          url: 'https://www.astro.ucsc.edu/',
          type: 'University'
        },
        {
          title: 'University of Maryland - Astronomy',
          description: 'Strong programs in various areas of astrophysics',
          url: 'https://www.astro.umd.edu/',
          type: 'University'
        },
        {
          title: 'Purdue University - Earth, Atmosphere & Planetary Sciences',
          description: 'Strong planetary science and atmospheric research programs',
          url: 'https://www.eaps.purdue.edu/',
          type: 'University'
        },
        {
          title: 'UCLA - Earth, Planetary, and Space Sciences',
          description: 'Comprehensive planetary science and space research programs',
          url: 'https://epss.ucla.edu/',
          type: 'University'
        }
          ]
        },
        {
          name: 'Research Centers & Observatories',
          items: [
            {
              title: 'Harvard CfA',
              description: 'Center for Astrophysics combining Harvard and Smithsonian research',
              url: 'https://www.cfa.harvard.edu/',
              type: 'Research Center'
            },
            {
              title: 'University of Arizona LPL',
              description: 'Lunar and Planetary Laboratory, leader in planetary science',
              url: 'https://www.lpl.arizona.edu/',
              type: 'Research Lab'
            },
            {
              title: 'Stanford KIPAC',
              description: 'Kavli Institute for Particle Astrophysics and Cosmology',
              url: 'https://kipac.stanford.edu/',
              type: 'Research Institute'
            },
            {
              title: 'Johns Hopkins University APL',
              description: 'Applied Physics Laboratory for Earth and planetary sciences',
              url: 'https://www.jhuapl.edu/',
              type: 'Research Lab'
            },
            {
              title: 'University of Colorado Boulder - LASP',
              description: 'Laboratory for Atmospheric and Space Physics, space missions leader',
              url: 'https://lasp.colorado.edu/',
              type: 'Research Lab'
            },
            {
              title: 'University of Texas at Austin - McDonald Observatory',
              description: 'Major center for stellar research with world-class observatory',
              url: 'https://mcdonaldobservatory.org/',
              type: 'Observatory'
            }
          ]
        }
      ]
    },
    {
      category: 'Data Archives & Observatories',
      subcategories: [
        {
          name: 'Data Archives & Surveys',
          items: [
        {
          title: 'SIMBAD',
          description: 'Astronomical database of objects beyond the solar system',
          url: 'http://simbad.cds.unistra.fr/',
          type: 'Database'
        },
        {
          title: 'ESA Gaia Archive',
          description: 'Gaia mission data for stellar positions, distances, and motions',
          url: 'https://gea.esac.esa.int/archive/',
          type: 'Archive'
        },
        {
          title: 'VizieR',
          description: 'Access to astronomical catalogs and data tables',
          url: 'https://vizier.cds.unistra.fr/',
          type: 'Catalog Service'
        },
        {
          title: 'NASA/IPAC Extragalactic Database',
          description: 'Database of extragalactic objects and their properties',
          url: 'https://ned.ipac.caltech.edu/',
          type: 'Database'
        },
        {
          title: 'Hubble Space Telescope Archive',
          description: 'Archive of observations from the Hubble Space Telescope',
          url: 'https://archive.stsci.edu/hst/',
          type: 'Archive'
        },
        {
          title: 'James Webb Space Telescope Archive',
          description: 'Latest observations from JWST with infrared imaging',
          url: 'https://archive.stsci.edu/jwst/',
          type: 'Archive'
        },
        {
          title: 'Sloan Digital Sky Survey',
          description: 'Major multi-filter imaging and spectroscopic survey',
          url: 'https://www.sdss.org/',
          type: 'Survey'
        },
          ]
        },
        {
          name: 'Ground-Based Observatories',
          items: [
            {
              title: 'European Southern Observatory',
              description: 'World\'s most productive ground-based astronomical observatory',
              url: 'https://www.eso.org/',
              type: 'Observatory'
            },
        {
          title: 'Keck Observatory',
          description: 'Twin 10-meter telescopes for optical and infrared astronomy',
          url: 'https://www.keckobservatory.org/',
          type: 'Observatory'
        },
        {
          title: 'Palomar Observatory',
          description: 'Historic observatory with 5-meter Hale telescope',
          url: 'https://www.astro.caltech.edu/palomar/',
          type: 'Observatory'
        },
        {
          title: 'Magellan Telescopes',
          description: 'Twin 6.5-meter telescopes in Chile for optical astronomy',
          url: 'https://www.lco.cl/',
          type: 'Observatory'
        },
        {
          title: 'Vera C. Rubin Observatory',
          description: 'LSST - Legacy Survey of Space and Time for dark energy research',
          url: 'https://www.lsst.org/',
          type: 'Observatory'
        }
          ]
        },
        {
          name: 'Space Telescopes',
          items: [
            {
              title: 'TESS Archive',
              description: 'Transiting Exoplanet Survey Satellite data for planet discoveries',
              url: 'https://archive.stsci.edu/tess/',
              type: 'Archive'
            },
        {
          title: 'Kepler/K2 Archive',
          description: 'Kepler Space Telescope data for exoplanet transit photometry',
          url: 'https://archive.stsci.edu/kepler/',
          type: 'Archive'
        },
        {
          title: 'Spitzer Archive',
          description: 'Spitzer Space Telescope infrared observations',
          url: 'https://archive.stsci.edu/spitzer/',
          type: 'Archive'
        },
        {
          title: 'Chandra X-ray Archive',
          description: 'Chandra X-ray Observatory data for high-energy astrophysics',
          url: 'https://cda.harvard.edu/chaser/',
          type: 'Archive'
        },
        {
          title: '2MASS',
          description: 'Two Micron All Sky Survey for infrared sky mapping',
          url: 'https://www.ipac.caltech.edu/2mass/',
          type: 'Survey'
        },
        {
          title: 'WISE/NEOWISE Archive',
          description: 'Wide-field Infrared Survey Explorer all-sky infrared survey',
          url: 'https://archive.stsci.edu/wise/',
          type: 'Archive'
        },
        {
          title: 'Planck Archive',
          description: 'ESA Planck mission data for cosmic microwave background studies',
          url: 'https://pla.esac.esa.int/',
          type: 'Archive'
        }
          ]
        }
      ]
    },
    {
      category: 'Programming & Computing',
      subcategories: [
        {
          name: 'Programming Languages & Tools',
          items: [
        {
          title: 'Python.org',
          description: 'Official Python programming language for astronomical computing',
          url: 'https://www.python.org/',
          type: 'Programming Language'
        },
        {
          title: 'Jupyter Notebooks',
          description: 'Interactive computing environment for data analysis',
          url: 'https://jupyter.org/',
          type: 'Tool'
        },
        {
          title: 'GitHub',
          description: 'Version control and collaborative development platform',
          url: 'https://github.com/',
          type: 'Platform'
        },
        {
          title: 'Stack Overflow',
          description: 'Programming Q&A community for troubleshooting',
          url: 'https://stackoverflow.com/',
          type: 'Community'
        }
          ]
        },
        {
          name: 'Python Libraries',
          items: [
            {
              title: 'NumPy',
              description: 'Fundamental library for scientific computing with arrays',
              url: 'https://numpy.org/',
              type: 'Python Library'
            },
            {
              title: 'Matplotlib',
              description: 'Most widely used plotting library for data visualization',
              url: 'https://matplotlib.org/',
              type: 'Python Library'
            },
            {
              title: 'SciPy',
              description: 'Scientific computing library with optimization and statistics',
              url: 'https://scipy.org/',
              type: 'Python Library'
            },
            {
              title: 'Pandas',
              description: 'Data structures and analysis tools for tabular data',
              url: 'https://pandas.pydata.org/',
              type: 'Python Library'
            },
            {
              title: 'scikit-image',
              description: 'Image processing library for Python scientific computing',
              url: 'https://scikit-image.org/',
              type: 'Python Library'
            },
        {
          title: 'APLpy',
          description: 'Publication-quality plots of astronomical FITS images',
          url: 'https://aplpy.github.io/',
          type: 'Python Library'
        },
        {
          title: 'emcee',
          description: 'Affine-invariant MCMC ensemble sampler for Bayesian analysis',
          url: 'https://emcee.readthedocs.io/',
          type: 'Python Library'
        },
        {
          title: 'astroplan',
          description: 'Observation planning package for astronomers',
          url: 'https://astroplan.readthedocs.io/',
          type: 'Python Library'
        },
        {
          title: 'PyRAF',
          description: 'Python interface to IRAF data reduction system',
          url: 'https://pyraf.readthedocs.io/',
          type: 'Python Library'
        },
        {
          title: 'Fortran Astrodynamics Toolkit',
          description: 'Modern Fortran library for orbital mechanics algorithms',
          url: 'https://jacobwilliams.github.io/Fortran-Astrodynamics-Toolkit/',
          type: 'Library'
        },
        {
          title: 'C++',
          description: 'High-performance language for simulations and computationally intensive astrophysics',
          url: 'https://isocpp.org/',
          type: 'Programming Language'
        },
        {
          title: 'Fortran',
          description: 'Still relevant for legacy codes and high-performance numerical simulations',
          url: 'https://fortran-lang.org/',
          type: 'Programming Language'
        },
        {
          title: 'IDL',
          description: 'Interactive Data Language for data analysis and visualization',
          url: 'https://www.nv5geospatialsoftware.com/Products/IDL',
          type: 'Programming Language'
        },
        {
          title: 'MATLAB',
          description: 'Technical computing platform for algorithm development',
          url: 'https://www.mathworks.com/products/matlab.html',
          type: 'Programming Language'
        },
        {
          title: 'R Statistical Computing',
          description: 'Statistical computing language for data analysis',
          url: 'https://www.r-project.org/',
          type: 'Programming Language'
        },
        {
          title: 'Fortran Astrodynamics Toolkit',
          description: 'Modern Fortran library for orbital mechanics algorithms',
          url: 'https://jacobwilliams.github.io/Fortran-Astrodynamics-Toolkit/',
          type: 'Library'
        },
        {
          title: 'PyRAF',
          description: 'Python interface to IRAF data reduction system',
          url: 'https://pyraf.readthedocs.io/',
          type: 'Python Library'
        }
          ]
        },
        {
          name: 'Development Environments',
          items: [
            {
              title: 'Jupyter Notebooks',
              description: 'Interactive computing environment for data analysis',
              url: 'https://jupyter.org/',
              type: 'Tool'
            },
            {
              title: 'Learn Astropy',
              description: 'Tutorials and guides for the Astropy Python package',
              url: 'https://learn.astropy.org/',
              type: 'Learning Resource'
            },
            {
              title: 'Practical Python for Astronomers',
              description: 'Online tutorial series for astronomical Python programming',
              url: 'https://python4astronomers.github.io/',
              type: 'Tutorial'
            }
          ]
        },
        {
          name: 'Operating Systems',
          items: [
            {
              title: 'Linux (Ubuntu/Debian)',
              description: 'Popular operating systems for astronomical computing',
              url: 'https://ubuntu.com/',
              type: 'Operating System'
            },
            {
              title: 'macOS',
              description: 'Unix-based system well-suited for astronomy and astrophotography',
              url: 'https://www.apple.com/macos/',
              type: 'Operating System'
            },
            {
              title: 'Windows Subsystem for Linux (WSL)',
              description: 'Run Unix-based astronomical programs on Windows',
              url: 'https://docs.microsoft.com/en-us/windows/wsl/',
              type: 'Tool'
            },
            {
              title: 'Debian Astro',
              description: 'Curated collection of astronomical software for Debian/Ubuntu',
              url: 'https://blends.debian.org/astro/',
              type: 'Software Distribution'
            }
          ]
        }
      ]
    },
    {
      category: 'Astrophotography Cameras & Equipment (2025)',
      subcategories: [
        {
          name: 'Mirrorless Cameras',
          items: [
            {
              title: 'Nikon Z8',
              description: 'Top choice with 45.7MP stacked sensor, excellent low-light, and astro features',
              url: 'https://www.nikonusa.com/en/nikon-products/product/mirrorless-cameras/z-8.html',
              type: 'Camera'
            },
            {
              title: 'Sony A7 IV',
              description: '33MP sensor with high ISO performance and reliable autofocus',
              url: 'https://electronics.sony.com/imaging/cameras/c/cameras',
              type: 'Camera'
            },
            {
              title: 'Canon EOS R6 Mark II',
              description: '24MP camera with excellent low-light performance for astrophotography',
              url: 'https://www.canon.com/eos/r6-mark-ii',
              type: 'Camera'
            },
            {
              title: 'Canon EOS R8',
              description: 'Lightweight full-frame camera excellent for travel astrophotography',
              url: 'https://www.canon.com/eos/r8',
              type: 'Camera'
            },
            {
              title: 'Sony A7S III',
              description: '12.1MP optimized for low-light with excellent video capabilities',
              url: 'https://electronics.sony.com/imaging/cameras/c/cameras',
              type: 'Camera'
            },
            {
              title: 'OM System OM-1 Mark II',
              description: 'Micro Four-Thirds camera with Starry Sky AF and Live Composite modes',
              url: 'https://www.olympus-global.com/products/cameras/om-1-mark-ii/',
              type: 'Camera'
            },
            {
              title: 'Panasonic Lumix S5',
              description: '24MP full-frame camera considered a good astrophotography option',
              url: 'https://www.panasonic.com/us/cameras-camcorders/cameras/lumix-mirrorless/dc-s5.html',
              type: 'Camera'
            }
          ]
        },
        {
          name: 'DSLR Cameras',
          items: [
            {
              title: 'Nikon D850',
              description: 'Best DSLR ever made with 45.7MP, excellent battery, illuminated buttons',
              url: 'https://www.nikonusa.com/en/nikon-products/product/dslr-cameras/d850.html',
              type: 'DSLR Camera'
            },
            {
              title: 'Pentax K-1 II',
              description: 'Weather-resistant 36.4MP DSLR with excellent dynamic range',
              url: 'https://us.ricoh-imaging.com/pentax-k-1-mark-ii',
              type: 'DSLR Camera'
            },
            {
              title: 'Nikon D780',
              description: 'Modern DSLR with weather-sealed body and good low-light performance',
              url: 'https://www.nikonusa.com/en/nikon-products/product/dslr-cameras/d780.html',
              type: 'DSLR Camera'
            },
            {
              title: 'Canon EOS 6D (Original)',
              description: 'Older but capable full-frame DSLR still regarded for astrophotography',
              url: 'https://www.canon.com/eos/6d',
              type: 'DSLR Camera'
            },
            {
              title: 'Pentax K-70',
              description: 'Good budget option under $1000 for astrophotography',
              url: 'https://us.ricoh-imaging.com/pentax-k-70',
              type: 'Budget DSLR'
            },
            {
              title: 'Nikon D810A',
              description: 'DSLR specifically modified for astrophotography with IR filter optimization',
              url: 'https://www.nikonusa.com/en/nikon-products/product-archive/dslr-cameras/d810a.html',
              type: 'Modified DSLR'
            }
          ]
        },
        {
          name: 'Dedicated Astronomy Cameras',
          items: [
        {
          title: 'ZWO ASI2600MM Pro',
          description: 'Monochrome cooled CMOS camera for advanced deep-sky imaging',
          url: 'https://astronomy-imaging-camera.com/product/asi2600mm-pro',
          type: 'Dedicated Astro Camera'
        }
          ]
        },
        {
          name: 'Mounts & Tracking Equipment',
          items: [
        {
          title: 'Sky-Watcher Star Adventurer',
          description: 'Portable star tracker for wide-field DSLR astrophotography',
          url: 'https://www.skywatcherusa.com/products/star-adventurer-2i',
          type: 'Star Tracker'
        },
        {
          title: 'Sky-Watcher EQ6-R Pro',
          description: 'Workhorse equatorial mount for serious astrophotography',
          url: 'https://www.skywatcherusa.com/products/eq6-r-pro',
          type: 'Mount'
        },
        {
          title: 'iOptron CEM26',
          description: 'Center-balanced equatorial mount with innovative design',
          url: 'https://www.ioptron.com/product-p/3600.htm',
          type: 'Mount'
        },
        {
          title: 'ZWO AM5',
          description: 'Harmonic drive mount offering high payload with lightweight design',
          url: 'https://astronomy-imaging-camera.com/product/am5',
          type: 'Harmonic Drive Mount'
        },
        {
          title: 'Sky-Watcher HEQ5 Pro',
          description: 'Popular entry-level to mid-range German equatorial mount',
          url: 'https://www.skywatcherusa.com/products/heq5-pro-synscan-goto-mount',
          type: 'Mount'
        },
        {
          title: 'Celestron Advanced VX',
          description: 'Versatile mount for both visual and astrophotography use',
          url: 'https://www.celestron.com/products/advanced-vx-computerized-mount',
          type: 'Mount'
        },
        {
          title: 'iOptron SkyGuider Pro',
          description: 'Excellent portable star tracker for wide-field astrophotography',
          url: 'https://www.ioptron.com/product-p/3322.htm',
          type: 'Star Tracker'
        },
        {
          title: 'Software Bisque Paramount',
          description: 'Observatory-grade mount for permanent setups with heavy payloads',
          url: 'https://www.bisque.com/product-category/mounts/',
          type: 'Observatory Mount'
        }
          ]
        },
        {
          name: 'Telescopes',
          items: [
        {
          title: 'Apertura 75Q Refractor',
          description: 'Best astrophotography refractor for 2025 with built-in field flattener',
          url: 'https://www.aperturaastronomy.com/apertura-75q-f-6-quadruplet-apo-refractor',
          type: 'Telescope'
        },
        {
          title: 'Celestron EdgeHD 8',
          description: 'Schmidt-Cassegrain with flat field optics for astrophotography',
          url: 'https://www.celestron.com/products/edgehd-8-optical-tube-assembly',
          type: 'Telescope'
        }
          ]
        },
        {
          name: 'Smart Telescopes',
          items: [
        {
          title: 'Celestron Origin',
          description: 'Best overall smart telescope for 2025 with automated features',
          url: 'https://www.celestron.com/products/origin-intelligent-home-observatory',
          type: 'Smart Telescope'
        },
        {
          title: 'ZWO Seestar S50',
          description: 'Best value smart telescope with all-in-one automation',
          url: 'https://astronomy-imaging-camera.com/product/seestar-s50',
          type: 'Smart Telescope'
        }
          ]
        }
      ]
    },
    {
      category: 'Computing Hardware for Astronomers (2025)',
      subcategories: [
        {
          name: 'Laptops',
          items: [
        {
          title: 'MacBook Pro M4 (2024)',
          description: 'Top choice with incredible performance and Liquid Retina XDR display',
          url: 'https://www.apple.com/macbook-pro/',
          type: 'Laptop'
        },
        {
          title: 'MacBook Pro M3 Pro (2023)',
          description: 'Best overall for astronomers with 36GB memory and 14-core GPU',
          url: 'https://www.apple.com/macbook-pro/',
          type: 'Laptop'
        },
        {
          title: 'MacBook Pro M3 Max',
          description: 'Unrivalled performance with 48GB memory and 40-core GPU',
          url: 'https://www.apple.com/macbook-pro/',
          type: 'Laptop'
        },
        {
          title: 'Microsoft Surface Laptop 7 (15-inch)',
          description: 'Best Windows laptop with Snapdragon X Elite CPU and 32GB RAM',
          url: 'https://www.microsoft.com/surface/devices/surface-laptop-7th-edition',
          type: 'Laptop'
        },
        {
          title: 'Dell XPS 16 9640',
          description: 'Intel Core Ultra 7 with RTX 4050 GPU and stunning display',
          url: 'https://www.dell.com/en-us/shop/dell-laptops/xps-16-laptop/spd/xps-16-9640-laptop',
          type: 'Laptop'
        },
        {
          title: 'ASUS ProArt Studiobook',
          description: 'High-performing workstation with 3.2K OLED display for astrophotography',
          url: 'https://www.asus.com/laptops/for-creators/proart-studiobook/',
          type: 'Laptop'
        },
        {
          title: 'MacBook Air M2',
          description: 'Portable option good for field use and less intensive tasks',
          url: 'https://www.apple.com/macbook-air/',
          type: 'Laptop'
        }
          ]
        },
        {
          name: 'Hardware Specifications',
          items: [
        {
          title: '32GB RAM Minimum',
          description: 'Recommended minimum RAM for serious astronomical work',
          url: 'https://www.crucial.com/memory',
          type: 'Hardware Spec'
        },
        {
          title: '1TB SSD Storage',
          description: 'Fast storage for large datasets and astronomical software',
          url: 'https://www.samsung.com/us/computing/memory-storage/solid-state-drives/',
          type: 'Hardware Spec'
        },
        {
          title: 'High-Resolution Display',
          description: 'Color-accurate display important for image processing and data visualization',
          url: '#',
          type: 'Hardware Spec'
        },
        {
          title: 'Dedicated GPU',
          description: 'For machine learning, intensive visualization, and GPU acceleration',
          url: 'https://www.nvidia.com/en-us/geforce/',
          type: 'Hardware Spec'
        }
          ]
        }
      ]
    },
    {
      category: 'Weather & Observing Conditions',
      subcategories: [
        {
          name: 'Weather Services',
          items: [
        {
          title: 'Astrospheric',
          description: 'Advanced weather forecasting service for North American astronomers',
          url: 'https://astrospheric.com/',
          type: 'Weather Service'
        },
        {
          title: 'Clear Sky Chart',
          description: 'Astronomical weather predictions for thousands of locations',
          url: 'https://www.cleardarksky.com/',
          type: 'Weather Service'
        },
        {
          title: 'Windy.com',
          description: 'Professional weather forecasting with detailed cloud and wind data',
          url: 'https://www.windy.com/',
          type: 'Weather Service'
        }
          ]
        },
        {
          name: 'Light Pollution & Dark Sky Tools',
          items: [
        {
          title: 'Light Pollution Map',
          description: 'Interactive map showing light pollution levels worldwide',
          url: 'https://www.lightpollutionmap.info/',
          type: 'Tool'
        },
        {
          title: 'Dark Site Finder',
          description: 'Find dark sky locations for optimal astronomical observations',
          url: 'https://darksitefinder.com/',
          type: 'Tool'
        },
        {
          title: 'International Dark-Sky Association',
          description: 'Organization dedicated to preserving dark skies',
          url: 'https://www.darksky.org/',
          type: 'Organization'
        }
          ]
        },
        {
          name: 'Atmospheric Data',
          items: [
        {
          title: 'Seeing Forecast',
          description: 'Atmospheric turbulence predictions for telescopic observations',
          url: 'https://www.meteoblue.com/en/weather/outdoorsports/seeing/',
          type: 'Weather Service'
        }
          ]
        },
        {
          name: 'Space Weather',
          items: [
        {
          title: 'NOAA Space Weather',
          description: 'Space weather conditions affecting radio and aurora observations',
          url: 'https://www.swpc.noaa.gov/',
          type: 'Space Weather'
        }
          ]
        }
      ]
    },
    {
      category: 'Citizen Science & Online Projects',
      subcategories: [
        {
          name: 'Galaxy Classification',
          items: [
        {
          title: 'Galaxy Zoo',
          description: 'Classify galaxies and help astronomers understand galaxy formation',
          url: 'https://www.galaxyzoo.org/',
          type: 'Citizen Science'
        },
        {
          title: 'Radio Galaxy Zoo',
          description: 'Classify radio galaxies and help understand cosmic evolution',
          url: 'https://radio.galaxyzoo.org/',
          type: 'Citizen Science'
        }
          ]
        },
        {
          name: 'Planet Hunting & Exoplanets',
          items: [
        {
          title: 'Planet Hunters',
          description: 'Search for exoplanets in Kepler and TESS data',
          url: 'https://www.planethunters.org/',
          type: 'Citizen Science'
        },
        {
          title: 'Asteroid Hunters',
          description: 'Help discover and track near-Earth asteroids',
          url: 'https://www.asteroidhunters.org/',
          type: 'Citizen Science'
        },
        {
          title: 'Disk Detective',
          description: 'Search for circumstellar disks around young stars',
          url: 'https://www.diskdetective.org/',
          type: 'Citizen Science'
        }
          ]
        },
        {
          name: 'Distributed Computing',
          items: [
        {
          title: 'SETI@home',
          description: 'Search for extraterrestrial intelligence using distributed computing',
          url: 'https://setiathome.berkeley.edu/',
          type: 'Citizen Science'
        },
        {
          title: 'Folding@home',
          description: 'Distributed computing for protein folding and astrobiology research',
          url: 'https://foldingathome.org/',
          type: 'Citizen Science'
        }
          ]
        },
        {
          name: 'Multi-Project Platforms',
          items: [
        {
          title: 'Zooniverse',
          description: 'Platform hosting multiple astronomy citizen science projects',
          url: 'https://www.zooniverse.org/',
          type: 'Platform'
        }
          ]
        }
      ]
    },
    {
      category: 'Observing Guides & Catalogs',
      subcategories: [
        {
          name: 'Star Charts & Atlases',
          items: [
        {
          title: 'Messier Catalog',
          description: 'Classic catalog of 110 deep-sky objects for amateur observation',
          url: 'https://messier.seds.org/',
          type: 'Catalog'
        },
        {
          title: 'NGC Catalog (New General Catalogue)',
          description: 'Comprehensive catalog of nebulae, star clusters, and galaxies',
          url: 'https://ngcicproject.observers.org/',
          type: 'Catalog'
        },
        {
          title: 'Caldwell Catalog',
          description: 'Patrick Moore\'s catalog of 109 bright deep-sky objects',
          url: 'https://en.wikipedia.org/wiki/Caldwell_catalogue',
          type: 'Catalog'
        }
          ]
        },
        {
          name: 'Observing Guides',
          items: [
        {
          title: 'Turn Left at Orion by Guy Consolmagno',
          description: 'Popular observing guide for amateur astronomers with small telescopes',
          url: 'https://www.amazon.com/Turn-Left-Orion-Hundreds-Telescope/dp/0521153972',
          type: 'Observing Guide'
        },
        {
          title: 'The Observer\'s Handbook (RASC)',
          description: 'Annual publication with essential data for astronomical observations',
          url: 'https://www.rasc.ca/observers-handbook',
          type: 'Annual Reference'
        },
        {
          title: 'Astronomical Calendar by Guy Ottewell',
          description: 'Annual guide to astronomical events and sky phenomena',
          url: 'https://universalworkshop.com/astronomical-calendar/',
          type: 'Annual Guide'
        },
        {
          title: 'Double Star Observer\'s Handbook',
          description: 'Specialized guide for observing double and multiple star systems',
          url: 'https://www.amazon.com/Observing-Handbook-Double-Multiple-Stars/dp/1441905464',
          type: 'Specialized Guide'
        },
        {
          title: 'Variable Star Observer\'s Handbook',
          description: 'Guide for observing and studying variable stars',
          url: 'https://www.aavso.org/',
          type: 'Specialized Guide'
        },
        {
          title: 'Deep Sky Observer\'s Guide by Kepple & Sanner',
          description: 'Comprehensive guide to over 2000 deep-sky objects',
          url: 'https://www.amazon.com/Night-Sky-Observers-Guide-Volume/dp/0943396387',
          type: 'Observing Guide'
        },
        {
          title: 'Practical Astronomy with your Calculator or Spreadsheet',
          description: 'Computational methods for astronomical calculations',
          url: 'https://www.amazon.com/Practical-Astronomy-Calculator-Spreadsheet-Duffett-Smith/dp/0521146542',
          type: 'Reference'
        }
          ]
        }
      ]
    },
    {
      category: 'Amateur Telescope Making & Equipment',
      subcategories: [
        {
          name: 'DIY Telescope Making',
          items: [
        {
          title: 'A Manual for Amateur Telescope Makers by Lecleire',
          description: 'First comprehensive mirror-making manual in English in over 40 years',
          url: 'https://shopatsky.com/products/manual-for-amateur-telescope-makers',
          type: 'Book'
        },
        {
          title: 'How to Make a Telescope by Jean Texereau',
          description: 'Classic, highly detailed, and rigorous guide to mirror making',
          url: 'https://www.amazon.com/How-Make-Telescope-Jean-Texereau/dp/0943396069',
          type: 'Book'
        },
        {
          title: 'The Dobsonian Telescope by Kriege & Berry',
          description: 'Excellent guide for building large-aperture truss-tube Dobsonians',
          url: 'https://www.amazon.com/Dobsonian-Telescope-Practical-Manual-Building/dp/0943396557',
          type: 'Book'
        },
        {
          title: 'Build Your Own Telescope by Richard Berry',
          description: 'Focus on mechanical construction of telescope mounts',
          url: 'https://www.amazon.com/Build-Your-Own-Telescope-Complete/dp/0943396042',
          type: 'Book'
        },
        {
          title: 'Stellafane ATM Site',
          description: 'Detailed step-by-step guide for building 6-inch f/7.5 Dobsonian telescope',
          url: 'https://stellafane.org/tm/dob/index.html',
          type: 'Tutorial'
        },
        {
          title: 'High Point Scientific',
          description: 'Telescope and astrophotography equipment dealer with extensive guides',
          url: 'https://www.highpointscientific.com/',
          type: 'Retailer'
        }
          ]
        },
        {
          name: 'Equipment Suppliers',
          items: [
        {
          title: 'OPT Telescopes',
          description: 'Comprehensive telescope equipment and astrophotography setups',
          url: 'https://optcorp.com/',
          type: 'Retailer'
        },
        {
          title: 'Celestron',
          description: 'Major telescope manufacturer with smart telescopes and traditional designs',
          url: 'https://www.celestron.com/',
          type: 'Manufacturer'
        },
        {
          title: 'Sky-Watcher',
          description: 'Telescope and mount manufacturer known for excellent value equipment',
          url: 'https://www.skywatcherusa.com/',
          type: 'Manufacturer'
        },
        {
          title: 'ZWO',
          description: 'Astronomy cameras, smart telescopes, and harmonic drive mounts',
          url: 'https://astronomy-imaging-camera.com/',
          type: 'Manufacturer'
        },
        {
          title: 'iOptron',
          description: 'Equatorial mounts including innovative center-balanced designs',
          url: 'https://www.ioptron.com/',
          type: 'Manufacturer'
        },
        {
          title: 'Apertura',
          description: 'Quality telescopes including refractors and Newtonians for astrophotography',
          url: 'https://www.aperturaastronomy.com/',
          type: 'Manufacturer'
        }
          ]
        }
      ]
    },
    {
      category: 'Notable Lectures & Historical Talks',
      subcategories: [
        {
          name: 'Classic Lectures',
          items: [
        {
          title: 'Carl Sagan\'s 1977 Christmas Lectures',
          description: 'Royal Institution lectures on planets and life in the universe',
          url: 'https://www.youtube.com/watch?v=aAxvxIOwnWM',
          type: 'Historical Lecture'
        },
        {
          title: 'Kip Thorne - Gravitational Waves Lectures',
          description: 'Comprehensive lectures on LIGO discoveries and gravitational wave physics',
          url: 'https://www.its.caltech.edu/~kip/index.html/lectures.html',
          type: 'Lecture Series'
        },
        {
          title: 'Neil deGrasse Tyson - Understanding Reality',
          description: 'Lectures on technological progress and our understanding of reality',
          url: 'https://www.youtube.com/watch?v=YDZh_gg1HIY',
          type: 'Modern Lecture'
        },
        {
          title: 'Merlin\'s Tour of the Universe',
          description: 'Neil deGrasse Tyson in conversation about cosmic perspectives',
          url: 'https://www.youtube.com/watch?v=IbG7T6dXYBU',
          type: 'Lecture'
        }
          ]
        },
        {
          name: 'Modern Lectures',
          items: [
        {
          title: 'Hiranya Peiris - Decoding the Cosmos',
          description: 'Royal Institution Discourse on cosmic mysteries by cosmologist',
          url: 'https://www.youtube.com/watch?v=1x7BAOi5noU',
          type: 'Modern Lecture'
        },
        {
          title: 'Feynman Lectures on Physics',
          description: 'Classic physics lectures including astrophysical applications',
          url: 'https://www.feynmanlectures.caltech.edu/',
          type: 'Classic Series'
        },
        {
          title: 'Walter Lewin - For the Love of Physics',
          description: 'Inspiring physics demonstrations and cosmic connections',
          url: 'https://www.youtube.com/user/walter',
          type: 'Educational Series'
        },
        {
          title: 'JWST Opening the Infrared Treasure Chest',
          description: 'Glenn Lecture at Smithsonian on James Webb Space Telescope discoveries',
          url: 'https://www.youtube.com/playlist?list=PL6RlkQnoCx_VhnmihukmlkGyzvAiiTgfF',
          type: 'Recent Lecture'
        },
        {
          title: 'Apollo 8 Astronauts Evening',
          description: 'Historical perspective from Apollo 8 crew members',
          url: 'https://www.youtube.com/playlist?list=PL6RlkQnoCx_VhnmihukmlkGyzvAiiTgfF',
          type: 'Historical Talk'
        },
        {
          title: 'Kip Thorne - My Romance with Black Holes',
          description: 'Personal journey through gravitational physics and LIGO discovery',
          url: 'https://bhi.fas.harvard.edu/news-articles/inaugural-bhi-hawking-lecture-speaker-kip-thorne-2/',
          type: 'Modern Lecture'
        }
          ]
        }
      ]
    }
  ]

  return (
    <div className="pt-16 pb-16 sm:pt-24 sm:pb-24 scroll-smooth">
      <PageClient />
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="prose dark:prose-invert max-w-none mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">A Comprehensive Compendium of Resources in Astronomy and Astrophysics</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            Everything you need to explore the universe, whether you're just starting to stargaze or diving deep into astrophysics research. From inspiring books and documentaries to professional software and cutting-edge equipment, this collection tries to cover it all.
          </p>

          {/* Table of Contents */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">📚</span>
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {resources.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-1 sm:space-y-2">
                  <a 
                    href={`#category-${categoryIndex}`}
                    className="block text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors break-words py-1 active:scale-95"
                  >
                    {category.category}
                  </a>
                  {'subcategories' in category && category.subcategories && (
                    <ul className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1">
                      {category.subcategories.map((subcategory, subIndex) => (
                        <li key={subIndex}>
                          <a 
                            href={`#subcategory-${categoryIndex}-${subIndex}`}
                            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors break-words leading-tight py-0.5 active:scale-95"
                          >
                            {subcategory.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          {resources.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 
                id={`category-${categoryIndex}`}
                className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3 scroll-mt-20 sm:scroll-mt-24 break-words"
              >
                {category.category}
              </h2>
              
              {/* Handle categories with subcategories */}
              {category.subcategories && (
                <div className="space-y-6 sm:space-y-8">
                  {category.subcategories.map((subcategory, subIndex) => (
                    <div key={subIndex}>
                      <h3 
                        id={`subcategory-${categoryIndex}-${subIndex}`}
                        className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200 border-l-4 border-blue-500 pl-3 sm:pl-4 scroll-mt-20 sm:scroll-mt-24 break-words"
                      >
                        {subcategory.name}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {subcategory.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {item.title}
                                </a>
                              </h4>
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full self-start sm:flex-shrink-0 sm:ml-3">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 sm:mb-4">
                              {item.description}
                            </p>
                            <div className="mt-3 sm:mt-4">
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center"
                              >
                                Visit Resource
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Contribute to This List
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
            Know of other valuable resources that should be included? Feel free to reach out with suggestions 
            for tools, databases, or educational materials that would benefit the astronomy and astrophysics community. 
            <br className="hidden sm:block"/>
            <span className="block sm:inline mt-2 sm:mt-0">
              If you feel any resource isn't up to the mark or is inappropriately placed, please suggest its removal 
              and explain why - your feedback helps keep this collection accurate and valuable!
            </span>
          </p>
          <a 
            href="mailto:kartik4321mandar@gmail.com?subject=Common Resources Suggestion" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-colors"
          >
            Suggest/Change a Resource
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}