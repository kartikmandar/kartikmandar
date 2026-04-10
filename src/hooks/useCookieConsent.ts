'use client';

import { useSyncExternalStore, useCallback } from 'react'
import type { ConsentPreferences, ConsentState } from '@/utilities/cookieConsent';
import {
  getConsentFromCookies,
  hasValidConsent,
  initializeConsent,
  clearConsent,
  DEFAULT_CONSENT_PREFERENCES,
} from '@/utilities/cookieConsent';

// Cached snapshots — useSyncExternalStore requires referentially stable results
// when the underlying data hasn't changed, otherwise it triggers infinite re-renders.
let cachedConsentState: ConsentState | null = null;
let cachedConsentJson = '';
let cachedBannerState = false;
let cachedBannerJson = '';

function getClientSnapshot(): ConsentState | null {
  const fresh = getConsentFromCookies();
  const json = JSON.stringify(fresh);
  if (json !== cachedConsentJson) {
    cachedConsentJson = json;
    cachedConsentState = fresh;
  }
  return cachedConsentState;
}

function getServerSnapshot(): ConsentState | null {
  return null;
}

function getBannerClientSnapshot(): boolean {
  const fresh = !hasValidConsent();
  const json = String(fresh);
  if (json !== cachedBannerJson) {
    cachedBannerJson = json;
    cachedBannerState = fresh;
  }
  return cachedBannerState;
}

function getBannerServerSnapshot(): boolean {
  return false;
}

// Subscribe to consent changes via custom events
function subscribe(callback: () => void): () => void {
  window.addEventListener('cookieConsentUpdated', callback);
  window.addEventListener('cookieConsentWithdrawn', callback);
  return () => {
    window.removeEventListener('cookieConsentUpdated', callback);
    window.removeEventListener('cookieConsentWithdrawn', callback);
  };
}

export function useCookieConsent() {
  const consentState = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const showBanner = useSyncExternalStore(subscribe, getBannerClientSnapshot, getBannerServerSnapshot);

  const acceptAll = useCallback(() => {
    initializeConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functionality: true,
    });
  }, []);

  const acceptNecessaryOnly = useCallback(() => {
    initializeConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functionality: false,
    });
  }, []);

  const savePreferences = useCallback((preferences: ConsentPreferences) => {
    initializeConsent(preferences);
  }, []);

  const withdrawConsent = useCallback(() => {
    clearConsent();
  }, []);

  return {
    consentState,
    isLoading: false,
    showBanner,
    acceptAll,
    acceptNecessaryOnly,
    savePreferences,
    withdrawConsent,
    analyticsConsent: consentState?.preferences?.analytics ?? false,
    preferences: consentState?.preferences || DEFAULT_CONSENT_PREFERENCES,
    hasConsented: consentState?.hasConsented || false,
  };
}
