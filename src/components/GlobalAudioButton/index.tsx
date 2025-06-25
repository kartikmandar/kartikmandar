'use client'

import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/providers/Audio'

export const GlobalAudioButton: React.FC = () => {
  const { isPlaying, toggleAudio } = useAudio()

  return (
    <div className="fixed right-7 bottom-7 z-50">
      <button
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Mute sound' : 'Play sound'}
        style={{
          transform: 'translateY(0px) scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '20px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px) scale(1)'
        }}
        className="group relative flex items-center justify-center w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 text-white/90 hover:text-white hover:bg-black/30 hover:border-white/20 shadow-2xl"
      >
        {isPlaying ? <Volume2 size={24} strokeWidth={2.2} /> : <VolumeX size={24} strokeWidth={2.2} />}
      </button>
    </div>
  )
}