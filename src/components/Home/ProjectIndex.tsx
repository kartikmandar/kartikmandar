import { ArrowUpRight } from 'lucide-react'
import { PROJECT_INDEX, type IndexedProject } from '@/data/projectIndex'

function Row({ project }: { project: IndexedProject }) {
  const body = (
    <>
      <h3 className="font-display text-2xl text-foreground transition-colors group-hover:text-ember md:text-3xl">
        {project.name}
        {project.href && <ArrowUpRight aria-hidden className="ml-1.5 inline size-4 align-baseline text-muted-foreground" />}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground md:pt-1.5">{project.description}</p>
    </>
  )
  const rowClass = 'group grid gap-2 border-b border-border py-5 transition-[padding] duration-300 hover:md:pl-3 md:grid-cols-2 md:gap-8'
  return project.href
    ? <a href={project.href} target="_blank" rel="noopener noreferrer" data-cursor="Open" className={rowClass}>{body}</a>
    : <div className={rowClass}>{body}</div>
}

export function ProjectIndex() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 md:px-10 md:pb-36">
      <p className="mono-label mb-4 text-ember">Index</p>
      <h2 className="font-display text-display-lg mb-8 tracking-[-0.015em] text-foreground md:mb-12">Projects</h2>
      <div className="border-t border-border">
        {PROJECT_INDEX.map((project) => <Row key={project.name} project={project} />)}
      </div>
    </section>
  )
}
