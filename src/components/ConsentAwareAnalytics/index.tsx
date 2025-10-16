'use client';

import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface ConsentAwareAnalyticsProps {
  _className?: string;
}

export function ConsentAwareAnalytics({ _className = '' }: ConsentAwareAnalyticsProps) {
  const { analyticsConsent, isLoading } = useCookieConsent();
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    // Only show analytics after checking consent
    if (!isLoading) {
      setShowAnalytics(analyticsConsent);
    }
  }, [analyticsConsent, isLoading]);

  // Don't render anything while loading or if consent is not given
  if (isLoading || !showAnalytics) {
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