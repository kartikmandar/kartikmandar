'use client'

import { useEffect, type ReactNode } from 'react'
import type { PostHog } from 'posthog-js'
import { useCookieConsent } from '@/hooks/useCookieConsent'

let cachedPosthog: PostHog | null = null

export function PostHogProvider({ children }: { children: ReactNode }) {
  const { analyticsConsent } = useCookieConsent()

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    if (!analyticsConsent) {
      if (cachedPosthog) {
        cachedPosthog.opt_out_capturing()
        cachedPosthog.reset()
      }
      return
    }

    if (cachedPosthog) {
      cachedPosthog.opt_in_capturing()
      return
    }

    let cancelled = false

    import('posthog-js')
      .then(({ default: posthog }) => {
        if (cancelled) return
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || '/ingest'
        posthog.init(key, {
          api_host: host,
          ui_host: 'https://us.posthog.com',
          defaults: '2026-01-30',
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: true,
          persistence: 'localStorage+cookie',
        })
        cachedPosthog = posthog
      })
      .catch(() => {
        /* posthog failed to load — silently disable */
      })

    return () => {
      cancelled = true
    }
  }, [analyticsConsent])

  return <>{children}</>
}

export function getPosthog(): PostHog | null {
  return cachedPosthog
}
