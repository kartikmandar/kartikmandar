import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { extractGoogleDriveId } from '../../hooks/extractGoogleDriveId'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Talks: CollectionConfig<'talks'> = {
  slug: 'talks',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultSort: '-talkDate',
  defaultPopulate: {
    title: true,
    slug: true,
    coverImage: true,
    abstract: true,
    shortDescription: true,
    talkType: true,
    duration: true,
    language: true,
    audienceLevel: true,
    targetAudience: true,
    eventDetails: true,
    scheduling: true,
    materials: true,
    topics: true,
    technologies: true,
    collaboration: true,
    professional: true,
    media: true,
    featured: true,
    displayOrder: true,
  },
  admin: {
    defaultColumns: ['title', 'eventDetails.eventName', 'scheduling.talkDate', 'scheduling.talkStatus', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Order for displaying talks (lower numbers appear first)',
        position: 'sidebar',
      },
    },
    // 1. Core Talk Information
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of your talk/presentation',
      },
    },
    {
      name: 'shortDescription',
      type: 'text',
      admin: {
        description: 'Brief description shown on talk cards (optional)',
      },
    },
    {
      name: 'abstract',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed abstract/description of the talk content',
      },
    },
    {
      name: 'talkType',
      type: 'select',
      options: [
        { label: 'Keynote', value: 'keynote' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Panel Discussion', value: 'panel' },
        { label: 'Lightning Talk', value: 'lightning' },
        { label: 'Presentation', value: 'presentation' },
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Demo', value: 'demo' },
        { label: 'Poster Session', value: 'poster' },
      ],
      admin: {
        description: 'Type of speaking engagement',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Duration of the talk in minutes',
      },
    },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'English', value: 'english' },
        { label: 'Spanish', value: 'spanish' },
        { label: 'French', value: 'french' },
        { label: 'German', value: 'german' },
        { label: 'Portuguese', value: 'portuguese' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'english',
      admin: {
        description: 'Language of the presentation',
      },
    },
    {
      name: 'audienceLevel',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Mixed/All Levels', value: 'mixed' },
      ],
      admin: {
        description: 'Technical level of the intended audience',
      },
    },
    {
      name: 'targetAudience',
      type: 'textarea',
      admin: {
        description: 'Description of the intended audience and their background',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image/thumbnail for the talk',
      },
    },

    // 2. Event & Venue Details
    {
      name: 'eventDetails',
      type: 'group',
      fields: [
        {
          name: 'eventName',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the conference, meetup, or event',
          },
        },
        {
          name: 'eventType',
          type: 'select',
          options: [
            { label: 'Conference', value: 'conference' },
            { label: 'Meetup', value: 'meetup' },
            { label: 'Workshop', value: 'workshop' },
            { label: 'Webinar', value: 'webinar' },
            { label: 'Symposium', value: 'symposium' },
            { label: 'Hackathon', value: 'hackathon' },
            { label: 'University Seminar', value: 'university' },
            { label: 'Corporate Event', value: 'corporate' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Type of event where you are speaking',
          },
        },
        {
          name: 'venue',
          type: 'textarea',
          admin: {
            description: 'Venue name, address, or virtual platform details',
          },
        },
        {
          name: 'eventWebsite',
          type: 'text',
          admin: {
            description: 'Official event website URL',
          },
        },
        {
          name: 'eventOrganizer',
          type: 'text',
          admin: {
            description: 'Organization or company hosting the event',
          },
        },
        {
          name: 'eventDescription',
          type: 'textarea',
          admin: {
            description: 'Brief description of the event context',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'City where the event takes place',
          },
        },
        {
          name: 'country',
          type: 'text',
          admin: {
            description: 'Country where the event takes place',
          },
        },
      ],
      admin: {
        description: 'Details about the event and venue',
      },
    },

    // 3. Scheduling & Status
    {
      name: 'scheduling',
      type: 'group',
      fields: [
        {
          name: 'talkDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Date when the talk will occur or occurred',
          },
        },
        {
          name: 'talkTime',
          type: 'text',
          admin: {
            description: 'Specific time of the talk (e.g., "2:30 PM - 3:15 PM")',
          },
        },
        {
          name: 'timezone',
          type: 'text',
          admin: {
            description: 'Timezone for the event (e.g., "EST", "PST", "UTC+1")',
          },
        },
        {
          name: 'talkStatus',
          type: 'select',
          options: [
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Postponed', value: 'postponed' },
          ],
          defaultValue: 'upcoming',
          required: true,
          admin: {
            description: 'Current status of the talk',
          },
        },
        {
          name: 'registrationUrl',
          type: 'text',
          admin: {
            description: 'Link for people to register or attend the talk',
          },
        },
      ],
      admin: {
        description: 'Scheduling and status information',
      },
    },

    // 4. Google Drive Materials
    {
      name: 'materials',
      type: 'group',
      fields: [
        {
          name: 'gDriveFolderId',
          type: 'text',
          admin: {
            description: 'Google Drive folder ID containing all talk materials (extract from folder share URL)',
            placeholder: 'e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          },
        },
        {
          name: 'gDriveFolderUrl',
          type: 'text',
          admin: {
            description: 'Complete Google Drive folder URL for direct access',
            placeholder: 'https://drive.google.com/drive/folders/...',
          },
        },
        {
          name: 'enableEmbedView',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show embedded Google Drive folder view in the talk modal',
          },
        },
        {
          name: 'embedHeight',
          type: 'number',
          defaultValue: 400,
          admin: {
            description: 'Height of the embedded Google Drive view (in pixels)',
            condition: (data, siblingData) => siblingData.enableEmbedView,
          },
        },
        {
          name: 'materialDescription',
          type: 'textarea',
          admin: {
            description: 'Description of what materials are available in the Google Drive folder',
            placeholder: 'This folder contains presentation slides, code examples, datasets, and additional resources...',
          },
        },
        {
          name: 'videoRecording',
          type: 'text',
          admin: {
            description: 'URL to video recording (YouTube, Vimeo, etc.) - separate from Drive folder',
          },
        },
        {
          name: 'liveStreamUrl',
          type: 'text',
          admin: {
            description: 'URL for live streaming the talk (if applicable)',
          },
        },
        {
          name: 'additionalLinks',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Demo', value: 'demo' },
                { label: 'GitHub Repository', value: 'github' },
                { label: 'Website', value: 'website' },
                { label: 'Article', value: 'article' },
                { label: 'Documentation', value: 'documentation' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'other',
            },
          ],
          admin: {
            description: 'Additional links not included in the Google Drive folder',
          },
        },
      ],
      admin: {
        description: 'Google Drive folder containing all presentation materials, slides, code, and resources',
      },
    },

    // 5. Technical & Topics
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
        description: 'Main topics and themes covered in the talk',
      },
    },
    {
      name: 'technologies',
      type: 'array',
      fields: [
        {
          name: 'technology',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Technologies, tools, or frameworks discussed',
      },
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Keywords for search optimization and categorization',
      },
    },
    {
      name: 'prerequisites',
      type: 'textarea',
      admin: {
        description: 'What the audience should know beforehand',
      },
    },
    {
      name: 'learningOutcomes',
      type: 'textarea',
      admin: {
        description: 'What attendees will learn from this talk',
      },
    },

    // 6. Speakers & Collaboration
    {
      name: 'collaboration',
      type: 'group',
      fields: [
        {
          name: 'coSpeakers',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'company',
              type: 'text',
            },
            {
              name: 'bio',
              type: 'textarea',
            },
            {
              name: 'linkedinUrl',
              type: 'text',
            },
            {
              name: 'twitterUrl',
              type: 'text',
            },
          ],
          admin: {
            description: 'Co-presenters and collaborators',
          },
        },
        {
          name: 'trackSession',
          type: 'text',
          admin: {
            description: 'Which track or session within the event',
          },
        },
        {
          name: 'acceptanceRate',
          type: 'number',
          admin: {
            description: 'Acceptance rate percentage (if competitive CFP)',
          },
        },
        {
          name: 'peerReviewed',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Was this talk peer-reviewed or academically vetted?',
          },
        },
        {
          name: 'invitedSpeaker',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Were you invited to speak (vs. applying through CFP)?',
          },
        },
      ],
      admin: {
        description: 'Collaboration and speaker details',
      },
    },

    // 7. Professional Details
    {
      name: 'professional',
      type: 'group',
      fields: [
        {
          name: 'honorarium',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Did you receive payment for this speaking engagement?',
          },
        },
        {
          name: 'travelSponsored',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Was travel/accommodation sponsored by the event?',
          },
        },
        {
          name: 'speakerBio',
          type: 'textarea',
          admin: {
            description: 'Speaker bio used for this specific event',
          },
        },
        {
          name: 'speakerPhoto',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Speaker photo used for event promotion',
          },
        },
      ],
      admin: {
        description: 'Professional and business details',
      },
    },

    // 8. Media & Documentation
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'eventPhotos',
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
              name: 'photographer',
              type: 'text',
            },
          ],
          admin: {
            description: 'Photos from the event or presentation',
          },
        },
        {
          name: 'socialMediaPosts',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Other', value: 'other' },
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
            },
          ],
          admin: {
            description: 'Related social media posts and mentions',
          },
        },
        {
          name: 'blogPosts',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'author',
              type: 'text',
            },
            {
              name: 'publishedDate',
              type: 'date',
            },
          ],
          admin: {
            description: 'Blog posts written about or related to the talk',
          },
        },
        {
          name: 'pressCoverage',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'publication',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'publishedDate',
              type: 'date',
            },
          ],
          admin: {
            description: 'Press coverage and media mentions',
          },
        },
      ],
      admin: {
        description: 'Media, photos, and documentation',
      },
    },

    // Standard fields
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this talk in featured sections',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When this talk information was published',
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
    beforeChange: [populatePublishedAt, extractGoogleDriveId],
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

export default Talks