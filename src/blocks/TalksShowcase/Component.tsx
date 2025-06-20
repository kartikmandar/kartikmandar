'use client'

import React, { useState } from 'react'
import { TalkCard, TalkModal, type Talk } from '@/components/TalkCard'
import type { Media, Talk as PayloadTalk } from '@/payload-types'

interface TalksShowcaseProps {
  blockName?: string
  blockType: 'talksShowcase'
  title?: string
  subtitle?: string
  showAllTalks?: boolean
  talks?: (string | PayloadTalk)[]
  showFeaturedOnly?: boolean
  maxTalks?: number
  layout?: 'grid-3' | 'grid-2' | 'grid-4' | 'mixed'
  showViewAllButton?: boolean
  viewAllButtonText?: string
  viewAllButtonUrl?: string
}

// Helper function to transform Payload talk to component talk
const transformPayloadTalk = (payloadTalk: PayloadTalk): Talk => {
  const talk: Talk = {
    id: payloadTalk.id.toString(),
    title: payloadTalk.title,
    shortDescription: payloadTalk.shortDescription || undefined,
    abstract: payloadTalk.abstract,
    coverImage: typeof payloadTalk.coverImage === 'number' ? undefined : payloadTalk.coverImage,
    talkType: payloadTalk.talkType || undefined,
    duration: payloadTalk.duration || undefined,
    language: payloadTalk.language || undefined,
    audienceLevel: payloadTalk.audienceLevel || undefined,
    targetAudience: payloadTalk.targetAudience || undefined,
  }

  // Transform event details
  if (payloadTalk.eventDetails) {
    talk.eventName = payloadTalk.eventDetails.eventName
    talk.eventType = payloadTalk.eventDetails.eventType || undefined
    talk.venue = payloadTalk.eventDetails.venue || undefined
    talk.city = payloadTalk.eventDetails.city || undefined
    talk.country = payloadTalk.eventDetails.country || undefined
    talk.eventUrl = payloadTalk.eventDetails.eventWebsite || undefined
    talk.organizerName = payloadTalk.eventDetails.eventOrganizer || undefined
  }

  // Transform scheduling details
  if (payloadTalk.scheduling) {
    talk.talkDate = payloadTalk.scheduling.talkDate
    talk.talkStatus = payloadTalk.scheduling.talkStatus as 'upcoming' | 'completed' | 'cancelled'
  }

  // Transform Google Drive materials
  if (payloadTalk.materials) {
    talk.gDriveFolderId = payloadTalk.materials.gDriveFolderId || undefined
    talk.gDriveFolderUrl = payloadTalk.materials.gDriveFolderUrl || undefined
    talk.enableEmbedView = payloadTalk.materials.enableEmbedView || false
    talk.embedHeight = payloadTalk.materials.embedHeight || 400
    talk.materialDescription = payloadTalk.materials.materialDescription || undefined
    talk.recordingUrl = payloadTalk.materials.videoRecording || undefined
    talk.liveStreamUrl = payloadTalk.materials.liveStreamUrl || undefined
    
    // Transform additional links
    if (payloadTalk.materials.additionalLinks?.length) {
      talk.additionalLinks = payloadTalk.materials.additionalLinks.map(link => ({
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        type: link.type as 'demo' | 'github' | 'website' | 'article' | 'documentation' | 'other' || 'other',
      }))
    }
  }

  // Transform topics and technologies
  if (payloadTalk.topics?.length) {
    talk.topics = payloadTalk.topics.map(topic => topic.topic)
  }
  if (payloadTalk.technologies?.length) {
    talk.technologies = payloadTalk.technologies.map(tech => tech.technology)
  }

  // Transform collaboration details
  if (payloadTalk.collaboration?.coSpeakers?.length) {
    talk.coSpeakers = payloadTalk.collaboration.coSpeakers.map(speaker => ({
      name: speaker.name,
      role: speaker.title || undefined,
      contact: speaker.linkedinUrl || speaker.twitterUrl || undefined,
    }))
  }

  // Transform professional details
  if (payloadTalk.professional) {
    talk.honorarium = payloadTalk.professional.honorarium ? 1 : undefined
    talk.travelSponsorship = payloadTalk.professional.travelSponsored || false
  }

  // Transform media
  if (payloadTalk.media) {
    // Transform photos
    if (payloadTalk.media.eventPhotos?.length) {
      talk.photos = payloadTalk.media.eventPhotos.map(photo => ({
        url: typeof photo.image === 'object' ? (photo.image as Media).url || '' : '',
        caption: photo.caption || undefined,
        alt: photo.caption || undefined,
      }))
    }

    // Transform social media coverage  
    if (payloadTalk.media.socialMediaPosts?.length) {
      talk.socialMediaCoverage = payloadTalk.media.socialMediaPosts.map(post => ({
        platform: post.platform,
        url: post.url,
        description: post.description || undefined,
      }))
    }

    // Transform press articles
    if (payloadTalk.media.pressCoverage?.length) {
      talk.pressArticles = payloadTalk.media.pressCoverage.map(article => ({
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

  // Transform Payload talks to component talks
  const talks: Talk[] = payloadTalks
    .filter((talk): talk is PayloadTalk => typeof talk === 'object' && talk !== null)
    .sort((a, b) => {
      // Sort by displayOrder (ascending), then by talkDate (descending) for ties
      const orderA = a.displayOrder ?? 999999
      const orderB = b.displayOrder ?? 999999
      if (orderA !== orderB) {
        return orderA - orderB
      }
      // If displayOrder is the same, sort by talkDate (newest first)
      if (a.scheduling?.talkDate && b.scheduling?.talkDate) {
        return new Date(b.scheduling.talkDate).getTime() - new Date(a.scheduling.talkDate).getTime()
      }
      // Fallback to createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, maxTalks)
    .map(transformPayloadTalk)

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
            No talks have been added yet. Add some talks in the CMS to see them here.
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