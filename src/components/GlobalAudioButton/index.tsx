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
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/90 hover:text-white transition-all duration-300 shadow-2xl hover:bg-black/30 hover:border-white/20 hover:scale-105 hover:-translate-y-1"
      >
        {isPlaying ? <Volume2 size={24} strokeWidth={2.2} /> : <VolumeX size={24} strokeWidth={2.2} />}
      </button>
    </div>
  )
}