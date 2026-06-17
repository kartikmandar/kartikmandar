import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  // Built via createElement, not JSX: once any file imports @react-three/fiber,
  // its global JSX augmentation narrows this dynamic tag's children to `never`
  // under react-jsx (TS2745). createElement keeps children as ReactNode.
  return React.createElement(
    Tag,
    htmlElement !== null ? { className } : {},
    isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />,
  )
}
