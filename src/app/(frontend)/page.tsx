import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from './[slug]/page.client'
import { AboutHero } from '@/components/AboutHero'
import { ProjectsShowcase } from '@/blocks/ProjectsShowcase/Component'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic' // Changed to dynamic to fetch data

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kartik Mandar - Astrophysicist & Software Developer',
    description: 'Welcome to my digital space where astrophysics meets modern software development. Discover my projects, research, and expertise.',
  }
}

export default async function HomePage() {
  // Fetch projects from database
  const payload = await getPayload({ config: configPromise })
  
  const projectsData = await payload.find({
    collection: 'projects',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 100, // Show max 100 projects on homepage
    sort: 'displayOrder',
  })

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
          projects={projectsData.docs}
          maxProjects={100}
          showViewAllButton={false}
        />
      </article>
    </>
  )
}