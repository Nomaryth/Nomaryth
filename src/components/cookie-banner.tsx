'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/i18n-context';
import { CookieFeedbackToast } from './cookie-feedback-toast';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  acceptedAt: Date;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
  acceptedAt: new Date()
};

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [feedbackType, setFeedbackType] = useState<'accepted' | 'rejected' | 'customized' | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const checkCookiePreferences = async () => {
      let hasPreferences = false;

      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/users/cookie-preferences', {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.preferences) {
              hasPreferences = true;
              setPreferences(data.preferences);
            }
          }
        } catch (error) {
          console.error('Error checking user cookie preferences:', error);
        }
      }

      const localPreferences = localStorage.getItem('nomaryth-cookie-preferences');
      if (localPreferences) {
        try {
          const parsed = JSON.parse(localPreferences);
          if (parsed.acceptedAt) {
            hasPreferences = true;
            setPreferences(parsed);
          }
        } catch (error) {
          console.error('Error parsing cookie preferences:', error);
        }
      }

      if (!hasPreferences) {
        setTimeout(() => setIsVisible(true), 1500);
      }
    };

    checkCookiePreferences();
  }, [user]);

  const saveCookiePreferences = async (newPreferences: CookiePreferences) => {
    try {
      localStorage.setItem('nomaryth-cookie-preferences', JSON.stringify(newPreferences));

      if (user) {
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/users/cookie-preferences', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(newPreferences),
          });
        } catch (error) {
          console.error('Error saving cookie preferences to profile:', error);
        }
      }

      setPreferences(newPreferences);
      setIsVisible(false);
      
      const hasAcceptedAll = newPreferences.analytics && newPreferences.marketing && newPreferences.personalization;
      const hasRejectedAll = !newPreferences.analytics && !newPreferences.marketing && !newPreferences.personalization;
      
      if (hasAcceptedAll) {
        setFeedbackType('accepted');
      } else if (hasRejectedAll) {
        setFeedbackType('rejected');
      } else {
        setFeedbackType('customized');
      }
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      acceptedAt: new Date()
    };
    saveCookiePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      acceptedAt: new Date()
    };
    saveCookiePreferences(onlyNecessary);
  };

  const handleSavePreferences = () => {
    const updatedPreferences: CookiePreferences = {
      ...preferences,
      necessary: true,
      acceptedAt: new Date()
    };
    saveCookiePreferences(updatedPreferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary' || key === 'acceptedAt') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <React.Fragment key="cookie-banner-modal">
          <motion.div
            key="cookie-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998]"
          />

          <div 
            key="cookie-banner-container"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsVisible(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card/95 to-accent/10 border-2 border-primary/30 shadow-2xl backdrop-blur-md ring-1 ring-white/20 dark:from-primary/20 dark:to-accent/20 dark:border-primary/40">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive z-10"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src="https://media.giphy.com/media/EKUvB9uFnm2Xe/giphy.gif"
                        alt="Cookie Monster"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <Cookie className="h-8 w-8 text-white hidden" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-headline text-primary mb-2 flex items-center gap-2">
                      <Cookie className="h-5 w-5" />
                      We use cookies to make your experience a bit better
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {showDetails ? (
                        "We use different types of cookies to enhance your browsing experience, analyze site traffic, and provide personalized content. You can choose which cookies to accept."
                      ) : (
                        "We use cookies to improve site functionality, analyze traffic, and provide a personalized experience. Your privacy matters to us."
                      )}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4 space-y-3 border-t border-border/50 pt-4"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">Necessary</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                              Required
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Essential for basic site functionality and security.
                          </p>
                        </div>
                        <div className="ml-3">
                          <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Settings className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">Analytics</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Help us understand how visitors use our site.
                          </p>
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => togglePreference('analytics')}
                            className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
                              preferences.analytics ? 'bg-primary justify-end' : 'bg-muted justify-start'
                            }`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Settings className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-sm">Marketing</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Used to show relevant ads and measure campaign effectiveness.
                          </p>
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => togglePreference('marketing')}
                            className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
                              preferences.marketing ? 'bg-primary justify-end' : 'bg-muted justify-start'
                            }`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Settings className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-sm">Personalization</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Remember your preferences and customize your experience.
                          </p>
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => togglePreference('personalization')}
                            className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
                              preferences.personalization ? 'bg-primary justify-end' : 'bg-muted justify-start'
                            }`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-3">
                  {showDetails ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowDetails(false)}
                        className="flex-1 border-primary/20 hover:bg-primary/5"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSavePreferences}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium"
                      >
                        Save Preferences
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleRejectAll}
                        className="flex-1 border-primary/20 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive"
                      >
                        No cookies
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDetails(true)}
                        className="flex-1 border-primary/20 hover:bg-primary/5"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                      <Button
                        onClick={handleAcceptAll}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium"
                      >
                        Yes, I accept
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    By continuing, you agree to our{' '}
                    <a
                      href="/privacy"
                      className="text-primary hover:text-accent underline underline-offset-2"
                    >
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a
                      href="/terms"
                      className="text-primary hover:text-accent underline underline-offset-2"
                    >
                      Terms of Service
                    </a>
                  </p>
                </div>
              </div>

              <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl opacity-60" />
              <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-lg opacity-60" />
            </Card>
            </motion.div>
          </div>
        </React.Fragment>
      )}
      
      <CookieFeedbackToast 
        type={feedbackType}
        onDismiss={() => setFeedbackType(null)}
        onOpenSettings={() => {
          setFeedbackType(null);
          setIsVisible(true);
          setShowDetails(true);
        }}
      />
    </AnimatePresence>
  );
}
