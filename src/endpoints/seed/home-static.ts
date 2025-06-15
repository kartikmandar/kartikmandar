import type { RequiredDataFromCollectionSlug } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Function to get featured projects for static homepage
export const getHomePageWithProjects = async (): Promise<RequiredDataFromCollectionSlug<'pages'>> => {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Fetch all projects sorted by display order (nulls last, then by creation date)
    const projects = await payload.find({
      collection: 'projects',
      sort: 'displayOrder,-createdAt',
    })

    return {
      ...homeStatic,
      layout: [
        {
          blockName: 'Cosmic Journey',
          blockType: 'cosmicJourney',
          title: 'A Cosmic Journey',
          subtitle: 'The story of a path written in the stars.',
        },
        {
          blockName: 'Featured Projects',
          blockType: 'projectsShowcase',
          title: 'My Projects',
          subtitle: '',
          projects: projects.docs,
          layout: 'grid-3',
          showViewAllButton: false,
          viewAllButtonText: 'View All Projects',
          viewAllButtonUrl: '/projects',
          maxProjects: projects.docs.length,
        },
      ],
    }
  } catch (error) {
    console.error('Error fetching projects for homepage:', error)
    // Fallback to static content without projects
    return homeStatic
  }
}

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Payload Website Template',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Visit the admin dashboard',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                fields: {
                  linkType: 'custom',
                  newTab: false,
                  url: '/admin',
                },
                format: '',
                indent: 0,
                version: 2,
              },
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ' to make your account and seed content for your website.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  meta: {
    description: 'An open-source website built with Payload and Next.js.',
    title: 'Payload Website Template',
  },
  title: 'Home',
  layout: [
    {
      blockName: 'Cosmic Journey',
      blockType: 'cosmicJourney',
      title: 'A Cosmic Journey',
      subtitle: 'The story of a path written in the stars.',
    },
    {
      blockName: 'Featured Projects',
      blockType: 'projectsShowcase',
      title: 'Featured Projects',
      subtitle: 'Discover our latest work showcasing innovation, technical excellence, and creative problem-solving',
      projects: [], // Will be populated when projects are added via CMS
      layout: 'grid-3',
      showViewAllButton: true,
      viewAllButtonText: 'View All Projects',
      viewAllButtonUrl: '/projects',
      maxProjects: 0,
    },
  ],
}
