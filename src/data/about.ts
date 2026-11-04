/**
 * The About page: life outside research, the journal club, certificates and
 * coursework. It replaces /hobbies, /journal-club, /certificates and /courses.
 */
export interface AboutItem {
  title: string
  description: string
}

export interface AboutPhoto {
  label: string
  caption: string
  /** Null until the owner's photo is in public/media/about. The page then shows an empty frame. */
  src: string | null
  alt: string
}

export interface JournalClubTalk {
  title: string
  presenter: string
  date: string
  href: string
  note?: string
}

export interface Certificate {
  title: string
  issuer?: string
  href: string
}

export interface Course {
  title: string
  credits: number
  href?: string
}

export const ABOUT_SECTIONS: { id: string; label: string }[] = [
  { id: 'outside-research', label: 'Outside research' },
  { id: 'journal-club', label: 'Journal club' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'courses', label: 'Courses' },
]

export const HOBBIES: AboutItem[] = [
  { title: 'Running', description: 'Running is more about the mind than the body.' },
  { title: 'Calisthenics', description: 'Bodyweight training, alongside the running.' },
  { title: 'Cycling', description: 'A proud road bike owner, but I still enjoy treks on an MTB from time to time.' },
  { title: 'Treks', description: 'Himalayan passes so far, including Rupin Pass and Hampta Pass.' },
  { title: 'Badminton', description: 'I trained and played competitively from 11th class, and captained the IISER Bhopal team at two Inter-IISER meets.' },
  { title: 'Astronomy', description: 'I love to gaze at the stars and study why our cosmos is the way it is.' },
  { title: 'Green tea', description: 'A green tea addict. My favourite is Organic India Tulsi-Mulethi.' },
  { title: 'Keyboards', description: 'I love mechanical keyboards. The current fad is a Royal Kludge 84 RGB 75% with Gateron Yellow switches.' },
]

export const ABOUT_PHOTOS: AboutPhoto[] = [
  { label: 'Treks', caption: 'In the Himalayas', src: null, alt: '' },
  { label: 'Badminton', caption: 'On court', src: null, alt: '' },
  { label: 'Oman eclipse', caption: 'The solar eclipse expedition to Oman', src: null, alt: '' },
  { label: 'Catania', caption: 'Catania, Italy', src: null, alt: '' },
]

export const JOURNAL_CLUB_FORMAT =
  'We met every Friday night. Papers could come from any part of astronomy and astrophysics, and anyone could join in or ask questions. Core members presented at least two papers a month, and now and then a researcher came to talk about their own work.'

export const JOURNAL_CLUB_TALKS: JournalClubTalk[] = [
  { title: 'Are your visibilities Validated?', presenter: 'Kartik Mandar', date: '14 March 2025', href: '/posters' },
  { title: 'On the Hubble Constant Tension in the SNe Ia Pantheon Sample', presenter: 'Mudit Parakh', date: '10 February 2025', href: 'https://iopscience.iop.org/article/10.3847/1538-4357/abeb73' },
  { title: 'If light waves are stretched by gravitational waves, how can we use light as a ruler to detect gravitational waves?', presenter: 'Roshan Dora', date: '10 February 2025', href: 'https://pubs.aip.org/aapt/ajp/article/65/6/501/530040/If-light-waves-are-stretched-by-gravitational' },
  { title: 'A Heuristic Introduction to Radioastronomical Polarization', note: 'First part', presenter: 'Kartik Mandar', date: '3 February 2025', href: 'https://arxiv.org/abs/astro-ph/0107327' },
  { title: 'Search for MeV gamma-ray emission from TeV bright red dwarfs with COMPTEL', presenter: 'Niharika Shrivastava', date: '26 January 2025', href: 'https://iopscience.iop.org/article/10.1088/1475-7516/2024/09/029/meta' },
  { title: 'The Dark Ages of the Universe', presenter: 'Kartik Mandar', date: '26 January 2025', href: 'https://lweb.cfa.harvard.edu/~loeb/sciam.pdf' },
]

export const CERTIFICATE_GROUPS: { label: string; items: Certificate[] }[] = [
  {
    label: 'Astronomy',
    items: [
      {
        title: 'Heliodyssey',
        href: 'https://drive.google.com/file/d/1dSc4QChMadlOvUtds_5DdnC9sPiUR1P8/view?usp=sharing',
        issuer: 'Astronomy olympiad. Won a solar eclipse expedition to Oman'
      },
      {
        title: 'IISER Bhopal Astronomy Club',
        href: 'https://drive.google.com/file/d/17yLOl6RB8qSAfKJo0coyfsgRLfaZCs0D/view?usp=sharing',
        issuer: 'IISER Bhopal'
      }
    ]
  },
  {
    label: 'Machine learning and data',
    items: [
      {
        title: 'Advanced Learning Algorithms',
        href: 'https://drive.google.com/file/d/1PcroWbFBzukGOiG9UgFCReaXvwHrjPKV/view?usp=sharing',
        issuer: 'Andrew Ng, Coursera'
      },
      {
        title: 'Supervised Machine Learning: Regression and Classification',
        href: 'https://drive.google.com/file/d/1HTwhW386f0Oggw4YBfFhcySSiC-O0ey4/view?usp=sharing',
        issuer: 'Andrew Ng, Coursera'
      },
      {
        title: 'Summer Analytics 24',
        href: 'https://drive.google.com/file/d/1C2nKmbivvmObLVSNItou5ebA2CTFq9ys/view?usp=sharing',
        issuer: 'IIT Guwahati'
      }
    ]
  },
  {
    label: 'MATLAB',
    items: [
      {
        title: 'AICTE - Mathworks - Internship',
        href: 'https://drive.google.com/file/d/1SbPWRhKFmadL7onLpz_5e3aNtpBwXS3u/view?usp=sharing',
        issuer: 'AICTE and MathWorks'
      },
      {
        title: 'MATLAB Onramp',
        href: 'https://drive.google.com/file/d/1P54Nvg_ysm5ZIB2mDixzognfwTIK-IFO/view?usp=sharing',
        issuer: 'MathWorks'
      },
      {
        title: 'MATLAB Signal Processing Onramp',
        href: 'https://drive.google.com/file/d/1_hCdiLHPhEcNjqJ02ynyGq5PWfyyalZQ/view?usp=sharing',
        issuer: 'MathWorks'
      },
      {
        title: 'MATLAB Image Processing Onramp',
        href: 'https://drive.google.com/file/d/1QHLM-jslPzxZyQGuy2b3hXr7nZNIxYaM/view?usp=sharing',
        issuer: 'MathWorks'
      },
      {
        title: 'MATLAB Machine Learning Onramp',
        href: 'https://drive.google.com/file/d/12ADT_d6NEiQh3WcQdE3qpNk9beGgBlqi/view?usp=sharing',
        issuer: 'MathWorks'
      },
      {
        title: 'MATLAB Deep Learning Onramp',
        href: 'https://drive.google.com/file/d/1Zd-k-4MmaCUzt6K4jzDIUFcFzrgF6Ubh/view?usp=sharing',
        issuer: 'MathWorks'
      }
    ]
  },
  {
    label: 'Programming and tools',
    items: [
      {
        title: 'Introduction to SQL',
        href: 'https://drive.google.com/file/d/1y6tu8mn-ZcUvpiQy6xBxKFsnl5kjRZYk/view?usp=sharing'
      },
      {
        title: 'Introduction to Git',
        href: 'https://drive.google.com/file/d/1E_VxGc-2sTFbOQzkIG9bQoxpMj65lNvA/view?usp=sharing'
      },
      {
        title: 'Python',
        href: 'https://drive.google.com/file/d/1HJqjidRzmU1VGXwWCflE0vVk30IMmX8q/view?usp=sharing'
      },
      {
        title: 'Learn Enough Command Line to Be Dangerous',
        href: 'https://www.learnenough.com/certificates/kartikmandar/command-line-tutorial',
        issuer: 'Learn Enough'
      },
      {
        title: 'Learn Enough Text Editor to Be Dangerous',
        href: 'https://www.learnenough.com/certificates/kartikmandar/text-editor-tutorial',
        issuer: 'Learn Enough'
      },
      {
        title: 'Learn Enough Git to Be Dangerous',
        href: 'https://www.learnenough.com/certificates/kartikmandar/git-tutorial',
        issuer: 'Learn Enough'
      },
      {
        title: 'Learn Enough HTML to Be Dangerous',
        href: 'https://www.learnenough.com/certificates/kartikmandar/html-tutorial',
        issuer: 'Learn Enough'
      },
      {
        title: 'Server Management',
        href: 'https://drive.google.com/file/d/1u8Bhofr1hLkjv0dxGq9pydyZPW_BYVIM/view?usp=sharing'
      }
    ]
  },
  {
    label: 'Web and mobile',
    items: [
      {
        title: 'Science Rendezvous 2023: Webmaster Certificate',
        href: 'https://drive.google.com/file/d/1Q0gmBHNFweyTHBFkpy9BvJ4SVhSy5Sf5/view?usp=sharing',
        issuer: 'Science Rendezvous'
      },
      {
        title: 'Mobile Sensor Data Collection App',
        href: 'https://drive.google.com/file/d/12heHcJyQIDzEO8ffAMtHIMKAL8_WO7Pq/view?usp=sharing'
      },
      {
        title: 'Responsive Web Design',
        href: 'https://drive.google.com/file/d/1qy5BPiL0uAT9Q9N-dH7gpStns_gqk91-/view?usp=sharing',
        issuer: 'freeCodeCamp'
      },
      {
        title: 'Web Development',
        href: 'https://drive.google.com/file/d/1ekhI8D7FON7ATc5_ODCIa8K33FqTBSxC/view?usp=sharing'
      }
    ]
  },
  {
    label: 'Learning and skills',
    items: [
      {
        title: 'Soft Skill Workshop',
        href: 'https://drive.google.com/file/d/1dnqt2m_rW28TXGb8WTeniurQ64A91UAO/view?usp=sharing'
      },
      {
        title: 'Learning How to Learn',
        href: 'https://drive.google.com/file/d/14X6MPcqGvXgNvPWSYBRBsBRoU7vZMO1A/view?usp=sharing'
      }
    ]
  }
]

/** Undergraduate coursework at IISER Bhopal. */
export const COURSE_GROUPS: { label: string; items: Course[] }[] = [
  {
    label: 'Physics',
    items: [
      {
        title: 'PHY101 Mechanics',
        credits: 3
      },
      {
        title: 'PHY106 Quantum Physics',
        credits: 3
      },
      {
        title: 'PHY201 Waves and Optics',
        credits: 3
      },
      {
        title: 'PHY209 Electromagnetism',
        credits: 3
      },
      {
        title: 'PHY206 Physics Through Computational Thinking',
        credits: 3
      },
      {
        title: 'PHY208 General Properties of Matter',
        credits: 3
      },
      {
        title: 'PHY301 Mathematical Methods I',
        credits: 4
      },
      {
        title: 'PHY303 Introduction to Quantum Mechanics',
        credits: 4
      },
      {
        title: 'PHY305 Classical Mechanics',
        credits: 4
      },
      {
        title: 'PHY309 Thermal Physics',
        credits: 4
      },
      {
        title: 'PHY311 Basic Electronics',
        credits: 3
      },
      {
        title: 'PHY302 Mathematical Methods II',
        credits: 4
      },
      {
        title: 'PHY304 Advanced Quantum Mechanics',
        credits: 4
      },
      {
        title: 'PHY306 Statistical Mechanics',
        credits: 4
      },
      {
        title: 'PHY312 Numerical Methods and Programming',
        credits: 4
      },
      {
        title: 'PHY314 Introduction to Special Relativity',
        credits: 3
      },
      {
        title: 'PHY402 Atomic and Molecular Physics',
        credits: 4
      },
      {
        title: 'PHY403 Condensed Matter Physics',
        credits: 4
      },
      {
        title: 'PHY404 Nuclear and Particle Physics',
        credits: 4
      },
      {
        title: 'PHY407 Electrodynamics',
        credits: 4
      },
      {
        title: 'PHY616 General Theory of Relativity',
        credits: 4
      },
      {
        title: 'PHY625 Quantum Information Theory',
        credits: 4
      },
      {
        title: 'PHY633 Introduction to Astronomy and Astrophysics',
        credits: 4
      }
    ]
  },
  {
    label: 'Physics labs and reports',
    items: [
      {
        title: 'PHY103 General Physics Laboratory I',
        credits: 1
      },
      {
        title: 'PHY205 General Physics Laboratory II',
        credits: 1
      },
      {
        title: 'PHY210 General Physics Laboratory III',
        credits: 1
      },
      {
        title: 'PHY307 Physics Laboratory I',
        credits: 3,
        href: 'https://drive.google.com/drive/folders/1pCb4K2eC-VbRmfzq4pspOEtdixwzo1F0?usp=sharing'
      },
      {
        title: 'PHY308 Physics Laboratory II',
        credits: 3,
        href: 'https://drive.google.com/drive/folders/1DenyGN62XTpiXMKFuvR3vwknHqJl1six?usp=sharing'
      },
      {
        title: 'PHY405 Condensed Matter Physics Laboratory',
        credits: 3,
        href: 'https://drive.google.com/drive/folders/1KaoUrqvGBhLn2o-Yxk65_68EdCpFXuyU?usp=sharing'
      },
      {
        title: 'PHY406 Nuclear Lab',
        credits: 3,
        href: 'https://drive.google.com/drive/folders/1oQgxrRIqhvYgU1uI8ubVgMNKnDzFVOch?usp=sharing'
      }
    ]
  },
  {
    label: 'Mathematics',
    items: [
      {
        title: 'MTH101 Calculus of One Variable',
        credits: 3
      },
      {
        title: 'MTH102 Linear Algebra',
        credits: 3
      },
      {
        title: 'MTH201 Multivariable Calculus',
        credits: 3
      },
      {
        title: 'MTH203 Introduction to Groups and Symmetry',
        credits: 3
      },
      {
        title: 'MTH202 Probability and Statistics',
        credits: 3
      },
      {
        title: 'MTH204 Complex Variables',
        credits: 3
      }
    ]
  },
  {
    label: 'Engineering and computing',
    items: [
      {
        title: 'CHE103 Engineering Design and Drawing',
        credits: 3
      },
      {
        title: 'ECS102 Introduction to Programming',
        credits: 3
      },
      {
        title: 'ECS201 Discrete Mathematics I',
        credits: 3
      },
      {
        title: 'ECS202 Data Structures and Algorithms',
        credits: 3
      },
      {
        title: 'ECS204 Signals and Systems',
        credits: 3
      },
      {
        title: 'ECS672 Electromagnetic Theory',
        credits: 4
      }
    ]
  },
  {
    label: 'Economics',
    items: [
      {
        title: 'ECO101 Principles of Economics I',
        credits: 3
      },
      {
        title: 'ECO102 Principles of Economics II',
        credits: 3
      },
      {
        title: 'ECO201 Econometrics I',
        credits: 4
      }
    ]
  },
  {
    label: 'Other courses and labs',
    items: [
      {
        title: 'BIO101 Biology I: Biomolecules',
        credits: 3
      },
      {
        title: 'BIO102 Biology II: Fundamentals of Cell Biology',
        credits: 3
      },
      {
        title: 'BIO103 General Biology Laboratory',
        credits: 1
      },
      {
        title: 'CHM101 General Chemistry',
        credits: 3
      },
      {
        title: 'CHM112 Basic Organic Chemistry I',
        credits: 3
      },
      {
        title: 'CHM114 Chemistry Laboratory I',
        credits: 1
      },
      {
        title: 'EES101 Earth Materials and Processes',
        credits: 3
      },
      {
        title: 'EES102 Introduction to Environmental Sciences',
        credits: 3
      },
      {
        title: 'HSS101 English for Communication',
        credits: 2
      },
      {
        title: 'IPR500 Law Relating to Intellectual Property and Patents',
        credits: 1
      },
      {
        title: 'PT101 Physical Training',
        credits: 0
      }
    ]
  }
]
