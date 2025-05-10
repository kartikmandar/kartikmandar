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
      {/* Down arrow at the bottom center */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 32,
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontSize: '2.5rem',
            textShadow: '0 2px 8px #000a',
            animation: 'bounceDown 1.6s infinite',
            pointerEvents: 'auto',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          aria-label="Scroll down"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth',
            })
          }}
        >
          ↓
        </span>
        <span
          style={{
            color: '#fff',
            fontSize: '1.1rem',
            marginTop: 8,
            textShadow: '0 2px 8px #000a',
            pointerEvents: 'auto',
            userSelect: 'none',
            background: 'rgba(0,0,0,0.32)',
            borderRadius: 12,
            padding: '2px 14px',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Scroll to zoom, drag to spin.
        </span>
        <style>{`
          @keyframes bounceDown {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(18px); }
          }
        `}</style>
      </div>
    </div>
  )
} 