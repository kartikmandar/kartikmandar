'use client';

import React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface ConsentAwareAnalyticsProps {
  _className?: string;
}

export function ConsentAwareAnalytics({ _className = '' }: ConsentAwareAnalyticsProps) {
  const { analyticsConsent, isLoading } = useCookieConsent();

  // Derived directly — no state or effect needed
  if (isLoading || !analyticsConsent) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Hook for server-side analytics integration
export function useAnalyticsConsent() {
  const { analyticsConsent, isLoading } = useCookieConsent();
  return { canTrack: analyticsConsent && !isLoading, isLoading };
}
