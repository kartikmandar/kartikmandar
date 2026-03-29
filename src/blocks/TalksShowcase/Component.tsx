'use client'

import React, { useState } from 'react'
import { TalkCard, TalkModal, type Talk } from '@/components/TalkCard'
import type { Talk as DataTalk } from '@/data/types'
import type { Media } from '@/data/types'

interface TalksShowcaseProps {
  blockName?: string
  blockType: 'talksShowcase'
  title?: string
  subtitle?: string
  showAllTalks?: boolean
  talks?: (string | DataTalk)[]
  showFeaturedOnly?: boolean
  maxTalks?: number
  layout?: 'grid-3' | 'grid-2' | 'grid-4' | 'mixed'
  showViewAllButton?: boolean
  viewAllButtonText?: string
  viewAllButtonUrl?: string
}

// Helper function to transform data talk to component talk
const transformDataTalk = (dataTalk: DataTalk): Talk => {
  const talk: Talk = {
    id: dataTalk.id.toString(),
    title: dataTalk.title,
    shortDescription: dataTalk.shortDescription || undefined,
    abstract: dataTalk.abstract,
    coverImage: typeof dataTalk.coverImage === 'number' ? undefined : dataTalk.coverImage,
    talkType: dataTalk.talkType || undefined,
    duration: dataTalk.duration || undefined,
    language: dataTalk.language || undefined,
    audienceLevel: dataTalk.audienceLevel || undefined,
    targetAudience: dataTalk.targetAudience || undefined,
  }

  // Transform event details
  if (dataTalk.eventDetails) {
    talk.eventName = dataTalk.eventDetails.eventName
    talk.eventType = dataTalk.eventDetails.eventType || undefined
    talk.venue = dataTalk.eventDetails.venue || undefined
    talk.city = dataTalk.eventDetails.city || undefined
    talk.country = dataTalk.eventDetails.country || undefined
    talk.eventUrl = dataTalk.eventDetails.eventWebsite || undefined
    talk.organizerName = dataTalk.eventDetails.eventOrganizer || undefined
  }

  // Transform scheduling details
  if (dataTalk.scheduling) {
    talk.talkDate = dataTalk.scheduling.talkDate
    talk.talkStatus = dataTalk.scheduling.talkStatus as 'upcoming' | 'completed' | 'cancelled'
  }

  // Transform Google Drive materials
  if (dataTalk.materials) {
    talk.gDriveFolderId = dataTalk.materials.gDriveFolderId || undefined
    talk.gDriveFolderUrl = dataTalk.materials.gDriveFolderUrl || undefined
    talk.enableEmbedView = dataTalk.materials.enableEmbedView || false
    talk.embedHeight = dataTalk.materials.embedHeight || 400
    talk.materialDescription = dataTalk.materials.materialDescription || undefined
    talk.recordingUrl = dataTalk.materials.videoRecording || undefined
    talk.liveStreamUrl = dataTalk.materials.liveStreamUrl || undefined

    if (dataTalk.materials.additionalLinks?.length) {
      talk.additionalLinks = dataTalk.materials.additionalLinks.map(link => ({
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        type: link.type as 'demo' | 'github' | 'website' | 'article' | 'documentation' | 'other' || 'other',
      }))
    }
  }

  // Transform topics and technologies
  if (dataTalk.topics?.length) {
    talk.topics = dataTalk.topics.map(topic => topic.topic)
  }
  if (dataTalk.technologies?.length) {
    talk.technologies = dataTalk.technologies.map(tech => tech.technology)
  }

  // Transform collaboration details
  if (dataTalk.collaboration?.coSpeakers?.length) {
    talk.coSpeakers = dataTalk.collaboration.coSpeakers.map(speaker => ({
      name: speaker.name,
      role: speaker.title || undefined,
      contact: speaker.linkedinUrl || speaker.twitterUrl || undefined,
    }))
  }

  // Transform professional details
  if (dataTalk.professional) {
    talk.honorarium = dataTalk.professional.honorarium ? 1 : undefined
    talk.travelSponsorship = dataTalk.professional.travelSponsored || false
  }

  // Transform media
  if (dataTalk.media) {
    if (dataTalk.media.eventPhotos?.length) {
      talk.photos = dataTalk.media.eventPhotos.map(photo => ({
        url: typeof photo.photo === 'object' ? (photo.photo as Media).url || '' : '',
        caption: photo.caption || undefined,
        alt: photo.caption || undefined,
      }))
    }

    if (dataTalk.media.socialMediaPosts?.length) {
      talk.socialMediaCoverage = dataTalk.media.socialMediaPosts.map(post => ({
        platform: post.platform,
        url: post.url,
        description: post.description || undefined,
      }))
    }

    if (dataTalk.media.pressCoverage?.length) {
      talk.pressArticles = dataTalk.media.pressCoverage.map(article => ({
        title: article.title,
        publication: article.publication,
        url: article.url,
        publishedDate: article.publishedDate || undefined,
      }))
    }
  }

  return talk
}

export const TalksShowcase: React.FC<TalksShowcaseProps> = ({ 
  title = 'Speaking Engagements',
  subtitle = 'Conferences, workshops, and presentations where I share insights on technology, innovation, and research',
  showAllTalks = false,
  talks: payloadTalks = [],
  layout = 'grid-3',
  maxTalks = 20,
}) => {
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(null)

  // Transform data talks to component talks
  const talks: Talk[] = payloadTalks
    .filter((talk): talk is DataTalk => typeof talk === 'object' && talk !== null)
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 999999
      const orderB = b.displayOrder ?? 999999
      if (orderA !== orderB) {
        return orderA - orderB
      }
      if (a.scheduling?.talkDate && b.scheduling?.talkDate) {
        return new Date(b.scheduling.talkDate).getTime() - new Date(a.scheduling.talkDate).getTime()
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
    .slice(0, maxTalks)
    .map(transformDataTalk)

  // Debug logging
  console.log('TalksShowcase Debug:', {
    showAllTalks,
    payloadTalksCount: payloadTalks.length,
    payloadTalks: payloadTalks.map(t => typeof t === 'object' ? { 
      title: t.title, 
      abstract: t.abstract,
      eventDetails: t.eventDetails,
      scheduling: t.scheduling 
    } : t),
    maxTalks,
    actualTalksShown: talks.length,
    transformedTalks: talks.map(t => ({ 
      title: t.title, 
      abstract: t.abstract,
      eventName: t.eventName,
      talkDate: t.talkDate 
    })),
    isLimitingResults: payloadTalks.length > maxTalks
  })

  // Grid class mapping
  const gridClasses = {
    'grid-2': 'md:grid-cols-2',
    'grid-3': 'md:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'md:grid-cols-2 lg:grid-cols-4',
    'mixed': 'md:grid-cols-2 lg:grid-cols-3',
  }

  // If no talks, show fallback content
  if (talks.length === 0) {
    return (
      <div id="my-talks" className="container my-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {subtitle}
          </p>
          <p className="text-muted-foreground">
            No talks have been added yet. Add some talks to src/data/talks.ts to see them here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div id="my-talks" className="container my-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${gridClasses[layout]} gap-8`}>
          {talks.map((talk) => (
            <TalkCard
              key={talk.id}
              talk={talk}
              onExpand={setSelectedTalk}
            />
          ))}
        </div>

      </div>

      {/* Modal */}
      {selectedTalk && (
        <TalkModal
          talk={selectedTalk}
          onClose={() => setSelectedTalk(null)}
        />
      )}
    </>
  )
}

export default TalksShowcase