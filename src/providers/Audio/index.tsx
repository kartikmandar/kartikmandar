'use client'

import React, { createContext, useContext, useState } from 'react'
import { setSoundVolume, startSound, stopSound } from '@/lib/audioEngine'

interface AudioContextType {
  isPlaying: boolean
  toggleAudio: () => void
  setVolume: (volume: number) => void
  volume: number
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  children: React.ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.3)

  const toggleAudio = () => {
    if (isPlaying) {
      stopSound()
      setIsPlaying(false)
      return
    }
    startSound(volume)
      .then(setIsPlaying)
      .catch((error) => {
        console.log('Audio play failed:', error)
        setIsPlaying(false)
      })
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    setSoundVolume(newVolume)
  }

  const value: AudioContextType = {
    isPlaying,
    toggleAudio,
    setVolume,
    volume,
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}
