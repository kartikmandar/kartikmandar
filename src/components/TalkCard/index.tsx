'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Video,
  FileText,
  Award,
  X,
  ChevronRight,
  Mic,
  Globe,
  Tag,
  Presentation,
  GraduationCap,
  Building,
  Download,
  Image as ImageIcon,
  Play
} from 'lucide-react'

import { Media } from '@/components/Media'
import type { Media as MediaType, Talk as PayloadTalk } from '@/payload-types'

// Transform interface for cleaner component props
export interface Talk {
  id: string
  title: string
  shortDescription?: string
  abstract: string
  coverImage?: MediaType | string | null
  talkType?: 'keynote' | 'workshop' | 'panel' | 'lightning' | 'presentation' | 'tutorial' | 'demo' | 'poster'
  duration?: number
  language?: 'english' | 'spanish' | 'french' | 'german' | 'portuguese' | 'other'
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  targetAudience?: string
  talkStatus?: 'upcoming' | 'completed' | 'cancelled'
  talkDate?: string
  eventName?: string
  eventType?: string
  venue?: string
  city?: string
  country?: string
  eventUrl?: string
  organizerName?: string
  organizerContact?: string
  gDriveFolderId?: string
  gDriveFolderUrl?: string
  enableEmbedView?: boolean
  embedHeight?: number
  materialDescription?: string
  recordingUrl?: string
  liveStreamUrl?: string
  additionalLinks?: Array<{
    title: string
    url: string
    description?: string
    type: 'demo' | 'github' | 'website' | 'article' | 'documentation' | 'other'
  }>
  topics?: string[]
  technologies?: string[]
  coSpeakers?: Array<{
    name: string
    role?: string
    contact?: string
  }>
  honorarium?: number
  travelSponsorship?: boolean
  accommodationProvided?: boolean
  photos?: Array<{
    url: string
    caption?: string
    alt?: string
  }>
  socialMediaCoverage?: Array<{
    platform: string
    url: string
    description?: string
  }>
  pressArticles?: Array<{
    title: string
    publication: string
    url: string
    publishedDate?: string
  }>
}

interface TalkCardProps {
  talk: Talk
  onExpand: (talk: Talk) => void
}

interface TalkModalProps {
  talk: Talk
  onClose: () => void
}

// Helper function to get status color
const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
}

// Helper function to get talk type icon
const getTalkTypeIcon = (type?: string) => {
  switch (type) {
    case 'keynote':
      return <Award className="w-4 h-4" />
    case 'workshop':
      return <GraduationCap className="w-4 h-4" />
    case 'panel':
      return <Users className="w-4 h-4" />
    case 'lightning':
      return <Presentation className="w-4 h-4" />
    case 'presentation':
      return <Mic className="w-4 h-4" />
    case 'tutorial':
      return <GraduationCap className="w-4 h-4" />
    case 'demo':
      return <Play className="w-4 h-4" />
    case 'poster':
      return <ImageIcon className="w-4 h-4" />
    default:
      return <Mic className="w-4 h-4" />
  }
}

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'TBD'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'TBD'
  }
}

// Helper function to format duration
const formatDuration = (minutes?: number): string => {
  if (!minutes) return ''
  
  if (minutes < 60) {
    return `${minutes}min`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }
}

export const TalkCard: React.FC<TalkCardProps> = ({ talk, onExpand }) => {
  const handleCardClick = () => {
    onExpand(talk)
  }

  return (
    <div
      className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      {talk.coverImage && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <Media
            resource={talk.coverImage}
            className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getTalkTypeIcon(talk.talkType)}
          <span className="text-sm font-medium text-muted-foreground capitalize">
            {talk.talkType || 'Talk'}
          </span>
        </div>
        
        {talk.talkStatus && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(talk.talkStatus)}`}>
            {talk.talkStatus.charAt(0).toUpperCase() + talk.talkStatus.slice(1)}
          </span>
        )}
      </div>

      {/* Title and Description */}
      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
        {talk.title}
      </h3>

      {talk.shortDescription && (
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {talk.shortDescription}
        </p>
      )}

      {/* Event Details */}
      <div className="space-y-2 mb-4">
        {talk.eventName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>{talk.eventName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(talk.talkDate)}</span>
        </div>

        {(talk.city || talk.country) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {[talk.city, talk.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {talk.duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(talk.duration)}</span>
          </div>
        )}
      </div>

      {/* Topics/Technologies */}
      {(talk.topics?.length || talk.technologies?.length) && (
        <div className="flex flex-wrap gap-1 mb-4">
          {[...(talk.topics || []), ...(talk.technologies || [])].slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {((talk.topics?.length || 0) + (talk.technologies?.length || 0)) > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              +{((talk.topics?.length || 0) + (talk.technologies?.length || 0)) - 3} more
            </span>
          )}
        </div>
      )}

      {/* Materials Available */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {(talk.gDriveFolderId || talk.gDriveFolderUrl) && (
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>Materials</span>
          </div>
        )}
        {talk.recordingUrl && (
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            <span>Recording</span>
          </div>
        )}
        {talk.additionalLinks?.some(link => link.type === 'github') && (
          <div className="flex items-center gap-1">
            <ExternalLink className="w-4 h-4" />
            <span>Code</span>
          </div>
        )}
      </div>

      {/* Expand Arrow */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  )
}

export const TalkModal: React.FC<TalkModalProps> = ({ talk, onClose }) => {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              {getTalkTypeIcon(talk.talkType)}
              <span className="text-sm font-medium text-muted-foreground capitalize">
                {talk.talkType || 'Talk'}
              </span>
              {talk.talkStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(talk.talkStatus)}`}>
                  {talk.talkStatus.charAt(0).toUpperCase() + talk.talkStatus.slice(1)}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground">{talk.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
          <div className="p-6 space-y-6">
            {/* Cover Image */}
            {talk.coverImage && (
              <div className="overflow-hidden rounded-lg">
                <Media
                  resource={talk.coverImage}
                  className="w-full h-64 object-cover object-center"
                />
              </div>
            )}

            {/* Event Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                
                {talk.eventName && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{talk.eventName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(talk.talkDate)}</span>
                </div>

                {(talk.city || talk.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {[talk.venue, talk.city, talk.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {talk.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDuration(talk.duration)}</span>
                  </div>
                )}

                {talk.language && talk.language !== 'english' && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{talk.language}</span>
                  </div>
                )}

                {talk.audienceLevel && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{talk.audienceLevel} Level</span>
                  </div>
                )}
              </div>

              {/* Materials & Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Materials</h3>
                
                <div className="space-y-2">
                  {talk.gDriveFolderUrl && (
                    <a
                      href={talk.gDriveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Materials Folder</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {talk.recordingUrl && (
                    <a
                      href={talk.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Video className="w-4 h-4" />
                      <span>Watch Recording</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {talk.liveStreamUrl && (
                    <a
                      href={talk.liveStreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Play className="w-4 h-4" />
                      <span>Live Stream</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {talk.eventUrl && (
                    <a
                      href={talk.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Event Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Abstract</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{talk.abstract}</ReactMarkdown>
              </div>
            </div>

            {/* Target Audience */}
            {talk.targetAudience && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Target Audience</h3>
                <p className="text-muted-foreground">{talk.targetAudience}</p>
              </div>
            )}

            {/* Topics & Technologies */}
            {(talk.topics?.length || talk.technologies?.length) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Topics & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {talk.topics?.map((topic, index) => (
                    <span
                      key={`topic-${index}`}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                  {talk.technologies?.map((tech, index) => (
                    <span
                      key={`tech-${index}`}
                      className="px-3 py-1 bg-secondary/50 text-secondary-foreground text-sm rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Co-speakers */}
            {talk.coSpeakers?.length && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Co-speakers</h3>
                <div className="space-y-2">
                  {talk.coSpeakers.map((speaker, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{speaker.name}</span>
                      {speaker.role && (
                        <span className="text-muted-foreground">({speaker.role})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Drive Embedded View */}
            {talk.enableEmbedView && talk.gDriveFolderId && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Materials Folder</h3>
                {talk.materialDescription && (
                  <p className="text-muted-foreground text-sm">{talk.materialDescription}</p>
                )}
                <div className="border border-border rounded-lg overflow-hidden bg-background">
                  <iframe
                    src={`https://drive.google.com/embeddedfolderview?id=${talk.gDriveFolderId}#grid`}
                    width="100%"
                    height={talk.embedHeight || 400}
                    className="w-full min-h-[400px] border-0"
                    title="Talk Materials"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* Additional Links */}
            {talk.additionalLinks?.length && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Additional Links</h3>
                <div className="space-y-2">
                  {talk.additionalLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      {link.type === 'github' && <ExternalLink className="w-4 h-4" />}
                      {link.type === 'demo' && <Play className="w-4 h-4" />}
                      {link.type === 'website' && <Globe className="w-4 h-4" />}
                      {link.type === 'article' && <FileText className="w-4 h-4" />}
                      {link.type === 'documentation' && <FileText className="w-4 h-4" />}
                      {link.type === 'other' && <ExternalLink className="w-4 h-4" />}
                      <span>{link.title}</span>
                      {link.description && (
                        <span className="text-muted-foreground text-sm">({link.description})</span>
                      )}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}