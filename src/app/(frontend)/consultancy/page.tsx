import { CardAction } from '@/components/ContentCard'
import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { CONTACT_EMAIL } from '@/constants/navigation'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Consultancy | Kartik Mandar',
    description: 'AI engineering and scientific software through Merakinist Labs and Upwork: self-hosted LLMs, document extraction, agents, RAG and research applications.',
    alternates: { canonical: getCanonicalUrl('/consultancy') },
    openGraph: {
      title: 'Consultancy - Kartik Mandar',
      description: 'AI engineering and scientific software through Merakinist Labs and Upwork.',
    },
  }
}

const SERVICES: { title: string; description: string }[] = [
  {
    title: 'Self-hosted LLMs',
    description: 'Fine-tuning and serving open models on your own GPUs, from benchmarking to a production endpoint.',
  },
  {
    title: 'Document extraction',
    description: 'Turning statements and scanned documents into structured data, with every figure traced back to its page.',
  },
  {
    title: 'Agents, RAG and pipelines',
    description: 'Production workflows, automations and AI product features, built around the work your business already does.',
  },
  {
    title: 'Scientific software',
    description: 'Simulation pipelines, data visualization and research applications, from someone who also uses them for research.',
  },
]

const PRINCIPLES: { title: string; description: string }[] = [
  {
    title: 'Start with the workflow',
    description: 'Sometimes the right system has no AI in it at all, and I will say so.',
  },
  {
    title: 'Check the model',
    description: 'Deterministic verification runs after the LLM step, and the code does the arithmetic.',
  },
  {
    title: 'Report honestly',
    description: 'Results come with what was measured and how. A number I can\'t back up doesn\'t get quoted.',
  },
]

function ItemGrid({ items, columns }: { items: { title: string; description: string }[]; columns: string }) {
  return (
    <dl className={`grid gap-x-10 gap-y-6 ${columns}`}>
      {items.map((item) => (
        <div key={item.title} className="border-t border-border pt-4">
          <dt className="font-display text-2xl text-foreground">{item.title}</dt>
          <dd className="mt-1 text-muted-foreground">{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function ConsultancyPage() {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Consultancy', url: `${serverUrl}/consultancy` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20 min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <PageHeader
          eyebrow="Software"
          title="Consultancy"
          lead="I build AI systems and scientific software through Merakinist Labs, my forward-deployed AI engineering lab, and as a Top Rated Plus freelancer on Upwork."
        />

        <div className="mb-16 flex flex-wrap gap-2">
          <CardAction href="https://merakinist.com/" primary>Visit Merakinist Labs</CardAction>
          <CardAction href="https://www.upwork.com/freelancers/kartikmandar?mp_source=share">View my Upwork profile</CardAction>
        </div>

        <section className="mb-16">
          <h2 className="mb-8 font-display text-display-md text-foreground">What I build</h2>
          <ItemGrid items={SERVICES} columns="sm:grid-cols-2" />
        </section>

        <section className="mb-16">
          <h2 className="mb-8 font-display text-display-md text-foreground">How I work</h2>
          <ItemGrid items={PRINCIPLES} columns="md:grid-cols-3" />
        </section>

        <section>
          <h2 className="mb-3 font-display text-display-md text-foreground">Have a workflow in mind?</h2>
          <p className="text-lg text-muted-foreground">
            Tell me what it does today and what you want to change.
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 block w-fit max-w-full break-words text-foreground underline decoration-ember underline-offset-4 transition-colors hover:text-ember">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
