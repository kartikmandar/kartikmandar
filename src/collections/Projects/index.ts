import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { githubSyncField } from '@/fields/githubSync'
import { bulkSyncField } from '@/fields/bulkSync'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
// import { autoSyncGitHub } from './hooks/autoSyncGitHub'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultSort: 'displayOrder',
  defaultPopulate: {
    title: true,
    slug: true,
    coverImage: true,
    projectStatus: true,
  },
  admin: {
    defaultColumns: ['title', 'displayOrder', 'projectStatus', 'category', 'updatedAt'],
    useAsTitle: 'title',
    // components: {
    //   beforeList: ['@/components/ProjectsBulkSync'],
    // },
  },
  fields: [
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Order for displaying projects (lower numbers appear first)',
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The main title of your project',
      },
    },
    {
      name: 'shortDescription',
      type: 'text',
      admin: {
        description: 'Brief description shown on project cards (optional)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the project',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image/thumbnail for the project card',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Web Development', value: 'web-development' },
        { label: 'Mobile Development', value: 'mobile-development' },
        { label: 'Artificial Intelligence', value: 'artificial-intelligence' },
        { label: 'Data Science', value: 'data-science' },
        { label: 'Scientific Computing', value: 'scientific-computing' },
        { label: 'UI/UX Design', value: 'ui-ux-design' },
        { label: 'DevOps', value: 'devops' },
        { label: 'Blockchain', value: 'blockchain' },
        { label: 'Game Development', value: 'game-development' },
        { label: 'Research', value: 'research' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Project category for organization',
      },
    },
    {
      name: 'projectStatus',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'active',
      required: true,
      admin: {
        description: 'Current status of the project',
      },
    },
    {
      name: 'techStack',
      type: 'array',
      fields: [
        {
          name: 'technology',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Technologies used in this project',
      },
    },
    {
      name: 'links',
      type: 'group',
      fields: [
        {
          name: 'githubUrl',
          type: 'text',
          admin: {
            description: 'GitHub repository URL',
          },
        },
        {
          name: 'demoUrl',
          type: 'text',
          admin: {
            description: 'Live demo/website URL',
          },
        },
        {
          name: 'githubStats',
          type: 'group',
          fields: [
            {
              name: 'stars',
              type: 'number',
              admin: {
                description: 'Number of GitHub stars (auto-synced)',
                readOnly: true,
              },
            },
            {
              name: 'forks',
              type: 'number',
              admin: {
                description: 'Number of GitHub forks (auto-synced)',
                readOnly: true,
              },
            },
            {
              name: 'watchers',
              type: 'number',
              admin: {
                description: 'Number of GitHub watchers (auto-synced)',
                readOnly: true,
              },
            },
            {
              name: 'openIssues',
              type: 'number',
              admin: {
                description: 'Number of open GitHub issues (auto-synced)',
                readOnly: true,
              },
            },
            {
              name: 'language',
              type: 'text',
              admin: {
                description: 'Primary programming language (auto-synced)',
                readOnly: true,
              },
            },
            {
              name: 'size',
              type: 'number',
              admin: {
                description: 'Repository size in KB (auto-synced)',
                readOnly: true,
              },
            },
            {
              name: 'lastUpdated',
              type: 'date',
              admin: {
                description: 'Last updated on GitHub (auto-synced)',
                readOnly: true,
              },
            },
          ],
          admin: {
            description: 'GitHub repository statistics (automatically updated)',
          },
        },
      ],
      admin: {
        description: 'External links and repository information',
      },
    },
    {
      name: 'projectDetails',
      type: 'group',
      fields: [
        {
          name: 'linesOfCode',
          type: 'number',
          admin: {
            description: 'Total lines of code (optional)',
          },
        },
        {
          name: 'architecture',
          type: 'textarea',
          admin: {
            description: 'Technical architecture description',
          },
        },
        {
          name: 'usageGuide',
          type: 'textarea',
          admin: {
            description: 'Installation and usage instructions',
          },
        },
        {
          name: 'problemSolving',
          type: 'textarea',
          admin: {
            description: 'What problem does this project solve?',
          },
        },
        {
          name: 'futureWork',
          type: 'textarea',
          admin: {
            description: 'Future roadmap and planned features',
          },
        },
        {
          name: 'readme',
          type: 'textarea',
          admin: {
            description: 'Repository README content (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'readmeIsMarkdown',
          type: 'checkbox',
          admin: {
            description: 'Whether the README is in Markdown format (auto-detected)',
            readOnly: true,
          },
        },
        {
          name: 'totalCommits',
          type: 'number',
          admin: {
            description: 'Total number of commits (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'contributors',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'contributions',
              type: 'number',
              required: true,
            },
            {
              name: 'githubUrl',
              type: 'text',
            },
            {
              name: 'avatarUrl',
              type: 'text',
            },
          ],
          admin: {
            description: 'Top contributors (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'fileCount',
          type: 'number',
          admin: {
            description: 'Total number of files (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'directoryCount',
          type: 'number',
          admin: {
            description: 'Total number of directories (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'repositorySize',
          type: 'number',
          admin: {
            description: 'Repository size in KB (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'defaultBranch',
          type: 'text',
          admin: {
            description: 'Default branch name (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'isArchived',
          type: 'checkbox',
          admin: {
            description: 'Is the repository archived? (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'isFork',
          type: 'checkbox',
          admin: {
            description: 'Is this repository a fork? (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'license',
          type: 'text',
          admin: {
            description: 'Repository license (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'topics',
          type: 'array',
          fields: [
            {
              name: 'topic',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'GitHub repository topics/tags (auto-synced)',
            readOnly: true,
          },
        },
        {
          name: 'createdAt',
          type: 'date',
          admin: {
            description: 'Repository creation date (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'homepage',
          type: 'text',
          admin: {
            description: 'Repository homepage URL (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'fileTree',
          type: 'array',
          fields: [
            {
              name: 'path',
              type: 'text',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'File', value: 'blob' },
                { label: 'Directory', value: 'tree' },
                { label: 'Submodule', value: 'commit' },
              ],
              required: true,
            },
            {
              name: 'size',
              type: 'number',
            },
            {
              name: 'url',
              type: 'text',
            },
          ],
          admin: {
            description: 'Repository file structure (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'githubIssues',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
              admin: {
                description: 'Total number of issues (auto-synced from GitHub)',
                readOnly: true,
              },
            },
            {
              name: 'open',
              type: 'number',
              admin: {
                description: 'Number of open issues (auto-synced from GitHub)',
                readOnly: true,
              },
            },
            {
              name: 'closed',
              type: 'number',
              admin: {
                description: 'Number of closed issues (auto-synced from GitHub)',
                readOnly: true,
              },
            },
          ],
          admin: {
            description: 'GitHub issues statistics (auto-synced)',
            readOnly: true,
          },
        },
        {
          name: 'githubPullRequests',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
              admin: {
                description: 'Total number of pull requests (auto-synced from GitHub)',
                readOnly: true,
              },
            },
            {
              name: 'open',
              type: 'number',
              admin: {
                description: 'Number of open pull requests (auto-synced from GitHub)',
                readOnly: true,
              },
            },
            {
              name: 'closed',
              type: 'number',
              admin: {
                description: 'Number of closed pull requests (auto-synced from GitHub)',
                readOnly: true,
              },
            },
            {
              name: 'merged',
              type: 'number',
              admin: {
                description: 'Number of merged pull requests (auto-synced from GitHub)',
                readOnly: true,
              },
            },
          ],
          admin: {
            description: 'GitHub pull requests statistics (auto-synced)',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Detailed project information for modal view',
      },
    },
    {
      name: 'publication',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Publication title',
          },
        },
        {
          name: 'authors',
          type: 'text',
          admin: {
            description: 'Publication authors',
          },
        },
        {
          name: 'venue',
          type: 'text',
          admin: {
            description: 'Journal, conference, or venue name',
          },
        },
        {
          name: 'year',
          type: 'number',
          admin: {
            description: 'Publication year',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Link to publication (DOI, arXiv, etc.)',
          },
        },
      ],
      admin: {
        description: 'Related academic publication (if any)',
      },
    },
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'plots',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'caption',
              type: 'text',
              required: true,
            },
            {
              name: 'alt',
              type: 'text',
              admin: {
                description: 'Alt text for accessibility',
              },
            },
          ],
          admin: {
            description: 'Charts, graphs, and data visualizations',
          },
        },
        {
          name: 'screenshots',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'caption',
              type: 'text',
              required: true,
            },
            {
              name: 'alt',
              type: 'text',
              admin: {
                description: 'Alt text for accessibility',
              },
            },
          ],
          admin: {
            description: 'Project screenshots and images',
          },
        },
        {
          name: 'posters',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'conference',
              type: 'text',
              required: true,
            },
            {
              name: 'year',
              type: 'number',
              required: true,
            },
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
          admin: {
            description: 'Conference posters and presentations',
          },
        },
      ],
      admin: {
        description: 'Images, plots, and media files for the project',
      },
    },
    {
      name: 'latestRelease',
      type: 'group',
      fields: [
        {
          name: 'version',
          type: 'text',
          admin: {
            description: 'Latest release version tag (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Release name (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            description: 'Release publication date (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Release notes/description (auto-synced from GitHub)',
            readOnly: true,
          },
        },
        {
          name: 'htmlUrl',
          type: 'text',
          admin: {
            description: 'Link to release on GitHub (auto-synced)',
            readOnly: true,
          },
        },
        {
          name: 'downloadCount',
          type: 'number',
          admin: {
            description: 'Total downloads across all assets (auto-synced)',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Latest GitHub release information (auto-synced)',
      },
    },
    {
      name: 'branches',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'protected',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'commitSha',
          type: 'text',
        },
      ],
      admin: {
        description: 'Repository branches (auto-synced from GitHub)',
        readOnly: true,
      },
    },
    {
      name: 'lastGitHubSync',
      type: 'date',
      admin: {
        description: 'Last time GitHub data was synchronized',
        readOnly: true,
        position: 'sidebar',
      },
    },
    ...bulkSyncField(),
    ...githubSyncField(),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this project in featured sections',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When this project was completed/published',
      },
    },
    ...slugField(),
    {
      name: 'meta',
      type: 'group',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({
          hasGenerateFn: true,
        }),
        MetaImageField({
          relationTo: 'media',
        }),
        MetaDescriptionField({}),
        PreviewField({
          hasGenerateFn: true,
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
        }),
      ],
      label: 'SEO',
      admin: {
        description: 'Search engine optimization settings',
      },
    },
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    // afterChange: [autoSyncGitHub], // Disabled auto-sync - use manual sync to avoid timeouts
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
    maxPerDoc: 50,
  },
}

export default Projects