import React from 'react'

import { AudioProvider } from './Audio'
import { MotionProvider } from './Motion'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <MotionProvider>
      <AudioProvider>
        {children}
      </AudioProvider>
    </MotionProvider>
  )
}
