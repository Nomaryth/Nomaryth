'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

export interface CookiePreferences {
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

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    let loadedPreferences: CookiePreferences | null = null;

    try {
      // First, try to load from user profile if logged in
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
              loadedPreferences = {
                ...data.preferences,
                acceptedAt: new Date(data.preferences.acceptedAt)
              };
            }
          }
        } catch (error) {
          console.error('Error loading user cookie preferences:', error);
        }
      }

      // Fallback to localStorage if no user preferences found
      if (!loadedPreferences) {
        const localPreferences = localStorage.getItem('nomaryth-cookie-preferences');
        if (localPreferences) {
          try {
            const parsed = JSON.parse(localPreferences);
            if (parsed.acceptedAt) {
              loadedPreferences = {
                ...parsed,
                acceptedAt: new Date(parsed.acceptedAt)
              };
            }
          } catch (error) {
            console.error('Error parsing local cookie preferences:', error);
          }
        }
      }

      setPreferences(loadedPreferences);
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePreferences = useCallback(async (newPreferences: CookiePreferences) => {
    try {
      // Always save to localStorage
      localStorage.setItem('nomaryth-cookie-preferences', JSON.stringify(newPreferences));

      // If user is logged in, also save to their profile
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
          // Continue with localStorage only
        }
      }

      setPreferences(newPreferences);
      return true;
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      return false;
    }
  }, [user]);

  const hasAccepted = useCallback((type: keyof Omit<CookiePreferences, 'acceptedAt'>) => {
    if (!preferences) return false;
    return preferences[type];
  }, [preferences]);

  const hasAnyPreferences = useCallback(() => {
    return preferences !== null;
  }, [preferences]);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      acceptedAt: new Date()
    };
    return savePreferences(allAccepted);
  }, [savePreferences]);

  const rejectAll = useCallback(() => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      acceptedAt: new Date()
    };
    return savePreferences(onlyNecessary);
  }, [savePreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    hasAccepted,
    hasAnyPreferences,
    savePreferences,
    acceptAll,
    rejectAll,
    loadPreferences
  };
}
