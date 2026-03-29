'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/utilities/ui'

type Props = {
  content: string
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function MarkdownContent(props: Props) {
  const { content, className, enableProse = true, enableGutter = true, ...rest } = props

  return (
    <div
      className={cn(
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
