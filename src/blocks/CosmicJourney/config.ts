import type { Block } from 'payload'

export const CosmicJourney: Block = {
  slug: 'cosmicJourney',
  interfaceName: 'CosmicJourneyBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'A Cosmic Journey',
      admin: {
        description: 'The main title for the cosmic journey timeline',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'The story of a path written in the stars.',
      admin: {
        description: 'The subtitle describing the journey',
      },
    },
  ],
}