import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from './[slug]/page.client'
import { AboutHero } from '@/components/AboutHero'
import { ProjectsShowcase } from '@/blocks/ProjectsShowcase/Component'
import { getPublishedProjects } from '@/data/projects'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kartik Mandar - Astrophysicist & Software Developer',
    description: 'Welcome to my digital space where astrophysics meets modern software development. Discover my projects, research, and expertise.',
  }
}

export default function HomePage() {
  const projects = getPublishedProjects()

  return (
    <>
      <PageClient />

      {/* About Me Section */}
      <AboutHero />

      {/* Projects Showcase Component */}
      <article className="pb-24">
        <ProjectsShowcase
          blockType="projectsShowcase"
          blockName="My Projects"
          layout="grid-3"
          projects={projects}
          maxProjects={100}
          showViewAllButton={false}
        />
      </article>
    </>
  )
}