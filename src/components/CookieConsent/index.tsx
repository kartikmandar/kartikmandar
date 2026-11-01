'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { isStoryFlight } from '@/lib/motion';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import type { ConsentPreferences } from '@/utilities/cookieConsent';
import { DEFAULT_CONSENT_PREFERENCES } from '@/utilities/cookieConsent';

interface CookieConsentBannerProps {
  className?: string;
}

/** How long the page settles before the consent card springs in. */
const CARD_DELAY_MS = 2400;

/**
 * A compact corner card (bottom-right, above the audio button) that springs in once the page has
 * settled, so it never sits over a hero or a caption on arrival. Customising
 * opens inline inside the card. It stays out of the story flight, whose copy
 * runs along the bottom of the screen.
 */
export function CookieConsentBanner({ className = '' }: CookieConsentBannerProps) {
  const {
    showBanner,
    isLoading,
    acceptAll,
    acceptNecessaryOnly,
    savePreferences,
  } = useCookieConsent();
  const pathname = usePathname();

  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_CONSENT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), CARD_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  const handlePreferenceChange = (category: keyof ConsentPreferences, value: boolean) => {
    if (category === 'necessary') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [category]: value }));
  };

  const visible = ready && !isLoading && showBanner && !isStoryFlight(pathname);

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          role="region"
          aria-label="Analytics consent"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } }}
          exit={{ opacity: 0, y: 24, transition: { duration: 0.25 } }}
          className={`fixed bottom-4 left-4 z-[var(--z-cookie)] border border-white/10 bg-popover/92 backdrop-blur-xl w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4 shadow-2xl sm:bottom-40 sm:left-auto sm:right-6 ${className}`}
        >
          <p className="mono-label mb-2 text-ember">Analytics</p>
          <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
            This website uses Vercel Analytics to understand how visitors interact with the site.
          </p>
          {/* Two short paragraphs, because one long one becomes the mobile LCP element when the card appears. */}
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            It&apos;s basically for me to feel good about how many people have visited the website.
            It&apos;s privacy-focused, cookie-free, and only collects anonymized data.
          </p>

          <AnimatePresence initial={false}>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="block font-medium text-foreground">Essential</span>
                      <span className="block text-xs text-muted-foreground">Required for basic site functionality</span>
                    </span>
                    <input type="checkbox" checked={preferences.necessary} disabled className="size-4 accent-[var(--ember)] disabled:opacity-50" />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="block font-medium text-foreground">Analytics</span>
                      <span className="block text-xs text-muted-foreground">Vercel Analytics (cookie-free, anonymized data only)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="size-4 accent-[var(--ember)]"
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {showSettings ? (
              <>
                <button
                  onClick={handleSavePreferences}
                  className="min-h-10 flex-1 rounded-full bg-foreground px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-ember"
                >
                  Save preferences
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="min-h-10 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={acceptAll}
                  className="min-h-10 flex-1 rounded-full bg-foreground px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-ember"
                >
                  Accept all
                </button>
                <button
                  onClick={acceptNecessaryOnly}
                  className="min-h-10 flex-1 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-foreground/40"
                >
                  Essential only
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="min-h-10 w-full text-left text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  aria-expanded={showSettings}
                >
                  Customize
                </button>
              </>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
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
        <div className="fixed inset-0 z-[var(--z-menu)] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Cookie settings">
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

