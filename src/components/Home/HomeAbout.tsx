import { Reveal } from '@/components/motion'
import { Portrait } from './Portrait'

export function HomeAbout() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-10 md:py-32">
      <Reveal>
        <Portrait />
      </Reveal>
      <Reveal delay={0.1} className="self-center">
        <p className="font-display text-display-md text-balance text-foreground">
          I study the early universe and build software that helps me do that.
        </p>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>
            I&apos;m doing an MSc in Physics (Astrophysics) at the University of Catania, after completing my Bachelors in Physics at the Indian Institute of Science Education and Research, Bhopal, in May 2025.
          </p>
          <p>
            My research centers on 21-cm cosmology, with a focus on forward-modelling interferometric pipelines (visibility simulators, antenna/beam simulations) and validating systematics for experiments like HERA. I also work on time-domain and spectral analysis of black hole X-ray binaries, ML methods for strong gravitational lensing, and open-source scientific software.
          </p>
          <p>
            I also work as a freelance developer and consultant, building research software, web platforms, and mobile applications for academic and industry clients.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
