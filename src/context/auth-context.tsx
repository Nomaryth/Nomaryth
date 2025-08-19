'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { useTheme } from 'next-themes';
import { useTranslation } from './i18n-context';
import type { UserProfile } from '@/lib/types';
import { useAdminStatus } from '@/lib/admin-utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getSecureStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to access localStorage:', error);
    }
    return null;
  }
};

const removeSecureStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to remove localStorage:', error);
    }
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { setTheme } = useTheme();
  const { setLanguage } = useTranslation();
  const profileUnsubscribe = useRef<Unsubscribe | null>(null);

  const { isAdmin, loading: adminLoading } = useAdminStatus(user?.uid || null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (profileUnsubscribe.current) {
        profileUnsubscribe.current();
        profileUnsubscribe.current = null;
      }

      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          await fetch('/api/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken }) });
        } catch {}
        if (db) {
            const userDocRef = doc(db, "users", currentUser.uid);
            profileUnsubscribe.current = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data() as UserProfile;
                    setProfile(data);
                    if (data.theme) setTheme(data.theme);
                    const userHasManuallySetLang = getSecureStorage('language_manual_set') === 'true';
                    if (data.language && !userHasManuallySetLang) {
                        setLanguage(data.language);
                    }
                }
            });
        }
      } else {
        try { await fetch('/api/session', { method: 'DELETE' }); } catch {}
        setTheme('system'); 
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe.current) {
        profileUnsubscribe.current();
      }
    };
  }, [setTheme]);

  const totalLoading = loading || adminLoading;

  return (
    <AuthContext.Provider value={{
      user,
      loading: totalLoading,
      isAdmin,
      profile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
