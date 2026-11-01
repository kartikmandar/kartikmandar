export interface NavItem {
  label: string
  url: string
}

export interface NavGroup {
  /** Group heading in the fullscreen menu. */
  label: string
  items: NavItem[]
}

/** The fullscreen menu, grouped the way a visitor thinks about the work. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Research',
    items: [
      { label: 'Publications', url: '/publications' },
      { label: 'Posters', url: '/posters' },
      { label: 'Posts', url: '/posts' },
    ],
  },
  {
    label: 'Software',
    items: [
      { label: 'Open Source', url: '/open-source' },
      { label: 'Consultancy', url: '/consultancy' },
    ],
  },
  {
    label: 'Talks & Teaching',
    items: [
      { label: 'Talks', url: '/talks' },
      { label: 'Journal Club', url: '/about#journal-club' },
      { label: 'Courses', url: '/about#courses' },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'My Story', url: '/my-story' },
      { label: 'CV', url: '/cv' },
      { label: 'About', url: '/about' },
      { label: 'Certificates', url: '/about#certificates' },
    ],
  },
  {
    label: 'Contact',
    items: [{ label: 'Contact', url: '/contact' }],
  },
]

/** Every page once, in menu order with Home first (footer, Cmd-K, sitemaps). */
export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Home', url: '/' },
  ...NAV_GROUPS.flatMap((group) => group.items),
]

export const CONTACT_EMAIL = 'contact@kartikmandar.com'

export const SOCIAL_LINKS: NavItem[] = [
  { label: 'GitHub', url: 'https://github.com/kartikmandar' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kartikmandar/' },
  { label: 'ORCID', url: 'https://orcid.org/0009-0002-6037-4613' },
  { label: 'Scholar', url: 'https://scholar.google.com/citations?hl=en&user=8vhqrogAAAAJ' },
]

/** Whether a nav url is the current page (or a parent of it). */
export function isActiveUrl(pathname: string | null, url: string): boolean {
  if (!pathname) return false
  if (url === '/') return pathname === '/'
  return pathname === url || pathname.startsWith(`${url}/`)
}
