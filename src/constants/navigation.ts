export interface NavItem {
  label: string
  url: string
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Home', url: '/' },
  { label: 'CV', url: 'https://drive.google.com/file/d/1Mt1mdXwKkwagocNu4DYbXNjDmA006zvA/view?usp=sharing' },
  { label: 'Consultancy', url: '/consultancy' },
  { label: 'Talks', url: '/talks' },
  { label: 'Publications', url: '/publications' },
  { label: 'Hobbies', url: '/hobbies' },
  { label: 'Certificates', url: '/404' },
  { label: 'Journal Club', url: '/404' },
  { label: 'Courses', url: '/404' },
  { label: 'Common Resources', url: '/common-resources' },
  { label: 'Blog', url: '/posts' },
  { label: 'Contact', url: '/contact' },
]