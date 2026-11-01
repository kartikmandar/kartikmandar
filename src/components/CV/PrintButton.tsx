'use client'

import { Printer } from 'lucide-react'
import { cardActionClass } from '@/components/ContentCard/cardAction'

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={cardActionClass(true)}>
      <Printer aria-hidden className="size-3.5" />
      Print or save as PDF
    </button>
  )
}
