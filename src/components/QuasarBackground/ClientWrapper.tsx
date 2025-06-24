'use client'

import dynamic from 'next/dynamic'
import { CSSProperties, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'

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
      audioRef.current = new Audio('/audio/quasar-compressed.mp3')
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
            background: 'rgba(0, 0, 0, 0.20)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.30)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 1)'
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.20)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {soundOn ? <Volume2 size={24} strokeWidth={2.2} /> : <VolumeX size={24} strokeWidth={2.2} />}
        </Button>
      </div>
    </div>
  )
} 