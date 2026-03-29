import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Welcome to my digital space where I try to showcase my work and interests. Also astronomy is cool and more people should know about it. I tend to work on using my software development skills to solve problems in astrophysics and related fields.',
  images: [
    {
      url: `${getServerSideURL()}/android-chrome-512x512.png`,
    },
  ],
  siteName: 'Kartik Mandar',
  title: 'Kartik Mandar - Astrophysicist & Software Developer',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
