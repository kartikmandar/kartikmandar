import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from '@/components/PageClient'
import { HomeAbout } from '@/components/Home/HomeAbout'
import { HomeHero } from '@/components/Home/HomeHero'
import { ProjectIndex } from '@/components/Home/ProjectIndex'
import { SelectedWorkGrid } from '@/components/Home/SelectedWorkGrid'
import { getCanonicalUrl } from '@/utilities/getURL'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kartik Mandar - Astrophysicist & Software Developer',
    description: 'Welcome to my digital space where astrophysics meets modern software development. Discover my projects, research, and expertise.',
    alternates: { canonical: getCanonicalUrl('/') },
  }
}

export default function HomePage() {
  return (
    <>
      <PageClient />
      <HomeHero />
      <HomeAbout />
      <SelectedWorkGrid />
      <ProjectIndex />
    </>
  )
}
