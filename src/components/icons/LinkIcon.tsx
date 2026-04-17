import * as Lucide from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { LinkIconConfig } from '@/data/links'
import { BrandGithubIcon } from './BrandGithubIcon'
import { LinkedInIcon } from './LinkedInIcon'
import { XIcon } from './XIcon'
import { RedditIcon } from './RedditIcon'
import { ScholarIcon } from './ScholarIcon'
import { OrcidIcon } from './OrcidIcon'

const COMPONENT_REGISTRY = {
  github: BrandGithubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  reddit: RedditIcon,
  scholar: ScholarIcon,
  orcid: OrcidIcon,
} as const

export function LinkIcon({ icon, className }: { icon: LinkIconConfig; className?: string }) {
  if (icon.kind === 'component') {
    const Component = COMPONENT_REGISTRY[icon.id]
    return <Component className={cn('h-5 w-5', className)} />
  }

  const LucideComponent = (Lucide as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon.name]
  if (!LucideComponent) {
    return <Lucide.Link2 className={cn('h-5 w-5', className)} />
  }
  return <LucideComponent className={cn('h-5 w-5', className)} />
}
