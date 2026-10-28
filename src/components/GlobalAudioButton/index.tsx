'use client'

import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/providers/Audio'

export const GlobalAudioButton: React.FC = () => {
  const { isPlaying, toggleAudio } = useAudio()

  return (
    <div className="fixed right-7 bottom-7 z-[var(--z-floating)]">
      <button
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Mute sound' : 'Play sound'}
        className="glass group relative flex items-center justify-center w-12 h-12 rounded-[20px] text-white/90 shadow-2xl transition-[transform,color,background-color] duration-300 ease-out-expo hover:-translate-y-1 hover:scale-[1.02] hover:text-white"
      >
        {isPlaying ? <Volume2 size={24} strokeWidth={2.2} /> : <VolumeX size={24} strokeWidth={2.2} />}
      </button>
    </div>
  )
}