import type { Block } from 'payload'

export const ProjectsShowcase: Block = {
  slug: 'projectsShowcase',
  interfaceName: 'ProjectsShowcaseBlock',
  labels: {
    singular: 'Projects Showcase',
    plural: 'Projects Showcases',
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
      defaultValue: 'Featured Projects',
      admin: {
        description: 'Main heading for the projects section',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'Discover our latest work showcasing innovation, technical excellence, and creative problem-solving',
      admin: {
        description: 'Subtitle/description below the main heading',
      },
    },
    {
      name: 'showAllProjects',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show all published projects automatically (ignores manual selection below)',
      },
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      required: false,
      admin: {
        description: 'Manually select specific projects to display (only used if "Show all projects" is unchecked)',
        sortOptions: 'title',
        condition: (data) => !data.showAllProjects,
      },
    },
    {
      name: 'showFeaturedOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only show projects marked as "featured"',
      },
    },
    {
      name: 'maxProjects',
      type: 'number',
      defaultValue: 20,
      min: 1,
      max: 50,
      admin: {
        description: 'Maximum number of projects to display',
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
        description: 'Layout style for the projects showcase',
      },
    },
    {
      name: 'showViewAllButton',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show "View All Projects" button at the bottom',
      },
    },
    {
      name: 'viewAllButtonText',
      type: 'text',
      defaultValue: 'View All Projects',
      admin: {
        condition: (data) => data.showViewAllButton,
        description: 'Text for the view all button',
      },
    },
    {
      name: 'viewAllButtonUrl',
      type: 'text',
      defaultValue: '/projects',
      admin: {
        condition: (data) => data.showViewAllButton,
        description: 'URL for the view all button',
      },
    },
  ],
}

export default ProjectsShowcase