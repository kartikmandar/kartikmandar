'use client'

import React from 'react'
import SupernovaEffect from '.'

interface SupernovaEffectWrapperProps {
  height?: string;
  style?: React.CSSProperties;
}

export default function SupernovaEffectWrapper({ 
  height = '100vh',
  style 
}: SupernovaEffectWrapperProps) {
  return (
    <SupernovaEffect 
      key="supernova-effect-singleton" 
      height={height}
      style={style}
    />
  )
} 