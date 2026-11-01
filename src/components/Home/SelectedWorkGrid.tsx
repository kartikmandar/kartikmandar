import Image from 'next/image'
import { Reveal } from '@/components/motion'
import { SELECTED_WORK } from '@/data/selectedWork'
import { cn } from '@/utilities/ui'

export function SelectedWorkGrid() {
  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20 md:px-10 md:pb-32">
      <p className="mono-label mb-4 text-ember">Selected work</p>
      <h2 className="font-display text-display-lg mb-10 tracking-[-0.015em] text-foreground md:mb-14">Signals so far</h2>
      <div className="grid auto-rows-[20rem] grid-cols-1 gap-4 md:auto-rows-[19rem] md:grid-cols-6">
        {SELECTED_WORK.map((work, index) => {
          const feature = index === 0
          return (
            <Reveal key={work.title} delay={index * 0.04} className={cn('md:col-span-2', feature && 'md:col-span-4 md:row-span-2')}>
              <a
                href={work.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Open"
                className="group relative flex size-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-card p-5 transition-colors hover:border-ember/50 md:p-6"
              >
                <Image
                  src={work.image}
                  alt={work.imageAlt}
                  fill
                  sizes={feature ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                  className="object-cover object-top opacity-60 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-85"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
                <div className="relative">
                  <h3 className={cn('font-display text-foreground', feature ? 'text-display-md' : 'text-3xl')}>{work.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/75">{work.summary}</p>
                </div>
              </a>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
