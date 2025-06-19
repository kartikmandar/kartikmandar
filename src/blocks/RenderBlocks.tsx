import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { CosmicJourney } from '@/blocks/CosmicJourney/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ProjectsShowcase } from '@/blocks/ProjectsShowcase/Component'
import { TalksShowcase } from '@/blocks/TalksShowcase/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cosmicJourney: CosmicJourney,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  projectsShowcase: ProjectsShowcase,
  talksShowcase: TalksShowcase,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // Remove default margin for CosmicJourney to seamlessly connect with QuasarBackground
              const blockMargin = blockType === 'cosmicJourney' ? '' : 'my-16'
              
              return (
                <div className={blockMargin} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
