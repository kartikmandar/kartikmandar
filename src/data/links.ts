export type LinkIconConfig =
  | { kind: 'lucide'; name: string }
  | { kind: 'component'; id: 'github' | 'linkedin' | 'x' | 'reddit' | 'scholar' | 'orcid' }

export type LinkCategory = 'primary' | 'social' | 'academic' | 'professional' | 'contact'

export type LinkItem = {
  id: string
  label: string
  description?: string
  href: string
  category: LinkCategory
  icon: LinkIconConfig
  featured?: boolean
}

export const LINKS: LinkItem[] = [
  {
    id: 'email-work',
    label: 'Work email',
    description: 'contact@kartikmandar.com',
    href: 'mailto:contact@kartikmandar.com',
    category: 'contact',
    icon: { kind: 'lucide', name: 'Mail' },
    featured: true,
  },
  {
    id: 'email-personal',
    label: 'Personal email',
    description: 'kartik4321mandar@gmail.com',
    href: 'mailto:kartik4321mandar@gmail.com',
    category: 'contact',
    icon: { kind: 'lucide', name: 'AtSign' },
    featured: true,
  },
  {
    id: 'academic-cv',
    label: 'Academic CV',
    href: 'https://drive.google.com/file/d/1Mt1mdXwKkwagocNu4DYbXNjDmA006zvA/view?usp=sharing',
    category: 'primary',
    icon: { kind: 'lucide', name: 'GraduationCap' },
    featured: true,
  },
  {
    id: 'professional-cv',
    label: 'Professional CV',
    href: 'https://drive.google.com/file/d/15PZLNWHPzwWEzjf4GhA3WJhXWlJXqkXg/view?usp=sharing',
    category: 'primary',
    icon: { kind: 'lucide', name: 'FileText' },
    featured: true,
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/kartikmandar',
    category: 'social',
    icon: { kind: 'component', id: 'github' },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kartikmandar/',
    category: 'social',
    icon: { kind: 'component', id: 'linkedin' },
  },
  {
    id: 'x',
    label: 'X / Twitter',
    href: 'https://x.com/kartik_mandar',
    category: 'social',
    icon: { kind: 'component', id: 'x' },
  },
  {
    id: 'reddit',
    label: 'Reddit',
    href: 'https://www.reddit.com/user/kartikmandar/',
    category: 'social',
    icon: { kind: 'component', id: 'reddit' },
  },
  {
    id: 'scholar',
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?hl=en&user=8vhqrogAAAAJ',
    category: 'academic',
    icon: { kind: 'component', id: 'scholar' },
  },
  {
    id: 'orcid',
    label: 'ORCID',
    href: 'https://orcid.org/0009-0002-6037-4613',
    category: 'academic',
    icon: { kind: 'component', id: 'orcid' },
  },
  {
    id: 'upwork',
    label: 'Upwork',
    href: 'https://www.upwork.com/freelancers/kartikmandar',
    category: 'professional',
    icon: { kind: 'lucide', name: 'Globe' },
  },
  {
    id: 'merakinist',
    label: 'Merakinist',
    description: 'My agency',
    href: 'https://merakinist.com',
    category: 'professional',
    icon: { kind: 'lucide', name: 'Sparkles' },
  },
]
