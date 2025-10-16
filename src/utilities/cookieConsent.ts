export interface ConsentPreferences {
  necessary: boolean; // Always true for essential cookies
  analytics: boolean;
  marketing: boolean;
  functionality: boolean;
}

export interface ConsentState {
  hasConsented: boolean;
  preferences: ConsentPreferences;
  timestamp: number | null;
  version: string;
}

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  necessary: true, // Essential cookies are always enabled
  analytics: false,
  marketing: false,
  functionality: false,
};

export const CONSENT_COOKIE_NAME = 'cookie-consent';
export const CONSENT_VERSION = '1.0.0';

// Server-side cookie handling utilities
export function getConsentFromCookies(): ConsentState | null {
  if (typeof window === 'undefined') {
    // Server-side: we'll handle this with cookies-next or server actions
    return null;
  }

  try {
    const cookieConsent = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

    if (!cookieConsent) return null;

    const cookieValue = cookieConsent.split('=')[1];
    if (!cookieValue) return null;

    const decodedValue = decodeURIComponent(cookieValue);
    return JSON.parse(decodedValue) as ConsentState;
  } catch (error) {
    console.warn('Error parsing consent cookie:', error);
    return null;
  }
}

export function setConsentCookie(consentState: ConsentState): void {
  if (typeof window === 'undefined') return;

  try {
    const cookieValue = encodeURIComponent(JSON.stringify(consentState));
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry

    document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax;`;
  } catch (error) {
    console.warn('Error setting consent cookie:', error);
  }
}

export function hasValidConsent(): boolean {
  const consent = getConsentFromCookies();

  if (!consent?.hasConsented) return false;

  // Check if consent version is current (for future updates)
  if (consent.version !== CONSENT_VERSION) return false;

  // Check if consent is not too old (1 year)
  if (!consent.timestamp) return false;
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  return consent.timestamp > oneYearAgo;
}

export function getConsentPreferences(): ConsentPreferences {
  const consent = getConsentFromCookies();
  return consent?.preferences || DEFAULT_CONSENT_PREFERENCES;
}

// Check if user has consented to analytics
export function hasAnalyticsConsent(): boolean {
  const preferences = getConsentPreferences();
  return preferences.analytics;
}

// Initialize with consent preferences
export function initializeConsent(preferences: ConsentPreferences): void {
  const consentState: ConsentState = {
    hasConsented: true,
    preferences,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };

  setConsentCookie(consentState);

  // Trigger custom event for other components to listen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: consentState
    }));
  }
}

// Clear consent (for withdrawal)
export function clearConsent(): void {
  if (typeof window === 'undefined') return;

  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  // Trigger custom event
  window.dispatchEvent(new CustomEvent('cookieConsentWithdrawn'));
}