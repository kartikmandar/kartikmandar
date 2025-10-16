'use client';

import React, { useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import type { ConsentPreferences } from '@/utilities/cookieConsent';
import { DEFAULT_CONSENT_PREFERENCES } from '@/utilities/cookieConsent';
import { useEffect } from 'react';

interface CookieConsentBannerProps {
  className?: string;
}

export function CookieConsentBanner({ className = '' }: CookieConsentBannerProps) {
  const {
    showBanner,
    isLoading,
    acceptAll,
    acceptNecessaryOnly,
    savePreferences,
  } = useCookieConsent();

  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_CONSENT_PREFERENCES);

  if (isLoading || !showBanner) {
    return null;
  }

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  const handlePreferenceChange = (category: keyof ConsentPreferences, value: boolean) => {
    if (category === 'necessary') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [category]: value }));
  };

  if (showSettings) {
    return (
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 ${className}`}>
        <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Cookie Preferences
          </h2>

          <p className="text-sm text-muted-foreground mb-6">
            This website uses Vercel Analytics to understand how visitors interact with the site.
            It&apos;s basically for me to feel good about how many people have visited the website.
            It&apos;s privacy-focused, doesn&apos;t use cookies, and only collects anonymized data.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-foreground">
                  Essential
                </label>
                <p className="text-sm text-muted-foreground">
                  Required for basic site functionality
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.necessary}
                disabled
                className="ml-2 w-4 h-4 text-primary bg-input border-border rounded disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-foreground">
                  Analytics
                </label>
                <p className="text-sm text-muted-foreground">
                  Vercel Analytics (cookie-free, anonymized data only)
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                className="ml-2 w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSavePreferences}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Save Preferences
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[9999] bg-card border-t border-border shadow-2xl backdrop-blur-lg ${className}`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website uses Vercel Analytics to understand how visitors interact with the site.
              It&apos;s basically for me to feel good about how many people have visited the website.
              It&apos;s privacy-focused, cookie-free, and only collects anonymized data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-end">
            <button
              onClick={acceptNecessaryOnly}
              className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-secondary-foreground bg-secondary border border-border rounded-md hover:bg-secondary/80 transition-colors min-h-[44px] touch-target"
            >
              Accept Essential Only
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-foreground bg-accent border border-border rounded-md hover:bg-accent/80 transition-colors min-h-[44px] touch-target"
            >
              Customize
            </button>
            <button
              onClick={acceptAll}
              className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 transition-colors shadow-lg min-h-[44px] touch-target"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CookieConsentSettingsProps {
  className?: string;
}

export function CookieConsentSettings({ className = '' }: CookieConsentSettingsProps) {
  const { preferences, savePreferences, withdrawConsent, hasConsented } = useCookieConsent();
  const [showModal, setShowModal] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(preferences);

  const handleSave = () => {
    savePreferences(editingPreferences);
    setShowModal(false);
  };

  const handleWithdraw = () => {
    withdrawConsent();
    setShowModal(false);
  };

  const handlePreferenceChange = (category: keyof ConsentPreferences, value: boolean) => {
    if (category === 'necessary') return;
    setEditingPreferences(prev => ({ ...prev, [category]: value }));
  };

  if (!hasConsented) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`text-xs text-muted-foreground hover:text-white transition-colors ${className}`}
      >
        Cookie Settings
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Cookie Settings
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-medium text-foreground">
                    Essential
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Required for basic site functionality
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editingPreferences.necessary}
                  disabled
                  className="ml-2 w-4 h-4 text-primary bg-input border-border rounded disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-medium text-foreground">
                    Analytics
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Vercel Analytics (cookie-free, anonymized data only)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editingPreferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  className="ml-2 w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSave}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-lg"
              >
                Save Changes
              </button>
              <button
                onClick={handleWithdraw}
                className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
              >
                Withdraw All Consent
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ProfileSelectorBannerProps {
  className?: string;
}

export function ProfileSelectorBanner({ className = '' }: ProfileSelectorBannerProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkProfileBannerDisplay = () => {
      const PROFILE_BANNER_KEY = 'profile-banner-last-shown';
      const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      const lastShown = localStorage.getItem(PROFILE_BANNER_KEY);
      const now = Date.now();

      // Show if never shown before or if more than one day has passed
      if (!lastShown || (now - parseInt(lastShown)) > ONE_DAY) {
        // Show after a short delay to not interrupt page load
        const timer = setTimeout(() => {
          setShowBanner(true);
          // Store the timestamp when banner is shown
          localStorage.setItem(PROFILE_BANNER_KEY, now.toString());
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    checkProfileBannerDisplay();
  }, []);

  const handleProfileSelection = (profile: 'developer' | 'researcher') => {
    setShowBanner(false);

    // Navigate to the selected profile
    if (profile === 'developer') {
      window.location.href = '/developer';
    } else {
      window.location.href = '/';
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-[9997] bg-card border border-border rounded-lg shadow-2xl p-6 backdrop-blur-lg max-w-2xl mx-auto ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Welcome! How would you like to explore?
        </h3>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Choose your preferred experience to explore my work and interests:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleProfileSelection('researcher')}
          className="p-4 bg-accent border border-border rounded-lg hover:bg-accent/80 transition-all hover:scale-105 group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                Research Page
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Astrophysics, research papers, academic work
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleProfileSelection('developer')}
          className="p-4 bg-accent border border-border rounded-lg hover:bg-accent/80 transition-all hover:scale-105 group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                Developer Page
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Software projects, code, technical work
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          You can always go to home or developer page to explore the respective profiles.
        </p>
      </div>
    </div>
  );
}