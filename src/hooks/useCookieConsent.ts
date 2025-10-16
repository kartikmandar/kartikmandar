'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConsentPreferences, ConsentState } from '@/utilities/cookieConsent';
import {
  getConsentFromCookies,
  hasValidConsent,
  initializeConsent,
  clearConsent,
  hasAnalyticsConsent,
  DEFAULT_CONSENT_PREFERENCES,
} from '@/utilities/cookieConsent';

export function useCookieConsent() {
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  // Initialize consent state on mount
  useEffect(() => {
    const consent = getConsentFromCookies();
    const hasConsent = hasValidConsent();

    setConsentState(consent);
    setShowBanner(!hasConsent);
    setIsLoading(false);

    // Listen for consent updates from other components
    const handleConsentUpdated = (event: CustomEvent) => {
      setConsentState(event.detail);
      setShowBanner(false);
    };

    const handleConsentWithdrawn = () => {
      setConsentState(null);
      setShowBanner(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cookieConsentUpdated', handleConsentUpdated as EventListener);
      window.addEventListener('cookieConsentWithdrawn', handleConsentWithdrawn);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cookieConsentUpdated', handleConsentUpdated as EventListener);
        window.removeEventListener('cookieConsentWithdrawn', handleConsentWithdrawn);
      }
    };
  }, []);

  const acceptAll = useCallback(() => {
    const allPreferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functionality: true,
    };
    initializeConsent(allPreferences);
  }, []);

  const acceptNecessaryOnly = useCallback(() => {
    const necessaryOnlyPreferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functionality: false,
    };
    initializeConsent(necessaryOnlyPreferences);
  }, []);

  const savePreferences = useCallback((preferences: ConsentPreferences) => {
    initializeConsent(preferences);
  }, []);

  const withdrawConsent = useCallback(() => {
    clearConsent();
  }, []);

  const analyticsConsent = hasAnalyticsConsent();

  return {
    consentState,
    isLoading,
    showBanner,
    acceptAll,
    acceptNecessaryOnly,
    savePreferences,
    withdrawConsent,
    analyticsConsent,
    preferences: consentState?.preferences || DEFAULT_CONSENT_PREFERENCES,
    hasConsented: consentState?.hasConsented || false,
  };
}