'use client'

import dynamic from 'next/dynamic'
import { CSSProperties } from 'react'

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
  return (
    <div style={{ 
      position: 'relative',
      height,
      width: '100%',
      ...style
    }}>
      <QuasarBackground />
    </div>
  )
}