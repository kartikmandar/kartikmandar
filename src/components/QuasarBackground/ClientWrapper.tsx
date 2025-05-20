'use client'

import dynamic from 'next/dynamic'
import { CSSProperties, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume, VolumeX } from 'lucide-react'

// Dynamically import the QuasarBackground with no SSR
const QuasarBackground = dynamic(
  () => import('./index'),
  { ssr: false }
)

interface QuasarBackgroundWrapperProps {
  height?: string | number;
  style?: CSSProperties;
}

export default function QuasarBackgroundWrapper({ 
  height = '70vh', // Default to 70% of viewport height
  style 
}: QuasarBackgroundWrapperProps) {
  // Sound button state and ref
  const [soundOn, setSoundOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleSoundToggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/media/quasar.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
    }
    if (soundOn) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setSoundOn(false)
    } else {
      audioRef.current.play()
      setSoundOn(true)
    }
  }

  return (
    <div style={{ 
      position: 'relative',
      height,
      width: '100%',
      ...style
    }}>
      <QuasarBackground />
      {/* Minimalist floating sound button (bottom right) */}
      <div style={{
        position: 'fixed',
        right: 28,
        bottom: 28,
        zIndex: 99,
        pointerEvents: 'auto',
      }}>
        <Button
          size="icon"
          variant="ghost"
          aria-label={soundOn ? 'Mute sound' : 'Play sound'}
          onClick={handleSoundToggle}
          style={{
            background: 'rgba(30,30,30,0.86)',
            color: '#fff',
            fontSize: '1.6em',
            borderRadius: 30,
            boxShadow: '0 2px 8px #0007',
            transition: 'background 0.2s',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {soundOn ? <Volume size={24} strokeWidth={2.2} /> : <VolumeX size={24} strokeWidth={2.2} />}
        </Button>
      </div>
    </div>
  )
} 