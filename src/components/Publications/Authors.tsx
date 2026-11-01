import React from 'react'
import type { Publication } from '@/data/publications'

/** An author list with the owner's name picked out. */
export function Authors({ authors }: { authors: Publication['authors'] }) {
  return (
    <>
      {authors.map(({ first, last }, index) => {
        const name = `${first} ${last}`
        return (
          <React.Fragment key={name}>
            {index > 0 && ', '}
            {last === 'Mandar' ? <strong className="font-medium text-foreground">{name}</strong> : name}
          </React.Fragment>
        )
      })}
    </>
  )
}
