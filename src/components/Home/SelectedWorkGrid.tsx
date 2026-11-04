import { ContentCard } from '@/components/ContentCard'
import { Reveal } from '@/components/motion'
import { SELECTED_WORK } from '@/data/selectedWork'
import { cn } from '@/utilities/ui'

export function SelectedWorkGrid() {
  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20 md:px-10 md:pb-32">
      <h2 className="font-display text-display-lg mb-10 tracking-[-0.015em] text-foreground md:mb-14">Selected work</h2>
      <div className="grid auto-rows-[20rem] grid-cols-1 gap-4 md:auto-rows-[19rem] md:grid-cols-6">
        {SELECTED_WORK.map((work, index) => {
          const lead = index === 0
          return (
            <Reveal key={work.title} delay={index * 0.04} className={cn('md:col-span-2', lead && 'md:col-span-4 md:row-span-2')}>
              <ContentCard
                variant="feature"
                prominent={lead}
                title={work.title}
                summary={work.summary}
                image={{ src: work.image, alt: work.imageAlt }}
                imageSizes={lead ? '(max-width: 768px) 100vw, 66vw' : undefined}
                href={work.href}
                external
              />
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
