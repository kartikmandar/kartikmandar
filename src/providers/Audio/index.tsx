'use client'

import React, { createContext, useContext, useRef, useState, useEffect } from 'react'

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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio on first interaction
  const initializeAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/quasar-compressed.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = volume
      
      // Add event listeners
      audioRef.current.addEventListener('play', () => setIsPlaying(true))
      audioRef.current.addEventListener('pause', () => setIsPlaying(false))
      audioRef.current.addEventListener('ended', () => setIsPlaying(false))
    }
  }

  const toggleAudio = () => {
    initializeAudio()
    
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // Handle promise for play() method
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Audio play failed:', error)
          setIsPlaying(false)
        })
      }
    }
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

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