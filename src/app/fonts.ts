// The type system: an editorial serif for display, a quiet sans for reading,
// and a mono for dates, identifiers and the story HUD.
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google'

export const displayFont = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

export const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const fontVariables = [displayFont.variable, sansFont.variable, monoFont.variable].join(' ')
