import type { Block } from 'payload'

export const TalksShowcase: Block = {
  slug: 'talksShowcase',
  interfaceName: 'TalksShowcaseBlock',
  labels: {
    singular: 'Talks Showcase',
    plural: 'Talks Showcases',
  },
  fields: [
    {
      name: 'blockName',
      type: 'text',
      label: 'Block Name',
      admin: {
        description: 'This is used for organization in the admin panel',
      },
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Speaking Engagements',
      admin: {
        description: 'Main heading for the talks section',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'Conferences, workshops, and presentations where I share insights on technology, innovation, and research',
      admin: {
        description: 'Subtitle/description below the main heading',
      },
    },
    {
      name: 'showAllTalks',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show all published talks automatically (ignores manual selection below)',
      },
    },
    {
      name: 'talks',
      type: 'relationship',
      relationTo: 'talks',
      hasMany: true,
      required: false,
      admin: {
        description: 'Manually select specific talks to display (only used if "Show all talks" is unchecked)',
        sortOptions: 'title',
        condition: (data) => !data.showAllTalks,
      },
    },
    {
      name: 'showFeaturedOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only show talks marked as "featured"',
      },
    },
    {
      name: 'maxTalks',
      type: 'number',
      defaultValue: 20,
      min: 1,
      max: 50,
      admin: {
        description: 'Maximum number of talks to display',
      },
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Grid (3 columns)', value: 'grid-3' },
        { label: 'Grid (2 columns)', value: 'grid-2' },
        { label: 'Grid (4 columns)', value: 'grid-4' },
        { label: 'Mixed (Featured + Grid)', value: 'mixed' },
      ],
      defaultValue: 'grid-3',
      admin: {
        description: 'Layout style for the talks showcase',
      },
    },
    {
      name: 'showViewAllButton',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show "View All Talks" button at the bottom',
      },
    },
    {
      name: 'viewAllButtonText',
      type: 'text',
      defaultValue: 'View All Talks',
      admin: {
        condition: (data) => data.showViewAllButton,
        description: 'Text for the view all button',
      },
    },
    {
      name: 'viewAllButtonUrl',
      type: 'text',
      defaultValue: '/talks',
      admin: {
        condition: (data) => data.showViewAllButton,
        description: 'URL for the view all button',
      },
    },
  ],
}

export default TalksShowcase