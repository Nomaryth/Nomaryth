'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

type Language = 'en' | 'pt';

interface Translations {
  [key: string]: string | Translations;
}

const translations: { [key in Language]: Translations } = {
  en,
  pt,
};

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedValue = (obj: any, key: string): string => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj) || key;
};

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

const setSecureStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to set localStorage:', error);
    }
  }
};

export const TranslationsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeLanguage = () => {
      const savedLanguage = getSecureStorage('language') as Language;
      const wasManuallySet = getSecureStorage('language_manual_set') === 'true';
      
      if (savedLanguage && ['en', 'pt'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      } else {
        const browserLang = typeof window !== 'undefined' ? 
          (navigator.language || navigator.languages?.[0] || 'en').toLowerCase() : 'en';
        
        const detectedLang: Language = browserLang.startsWith('pt') ? 'pt' : 'en';
        setLanguage(detectedLang);
        setSecureStorage('language', detectedLang);
      }
      
      setIsInitialized(true);
    };

    const timer = setTimeout(initializeLanguage, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setSecureStorage('language', lang);
    setSecureStorage('language_manual_set', 'true');
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const raw = getNestedValue(translations[language], key);
    if (!vars) return raw;
    return Object.keys(vars).reduce((acc, k) => acc.replace(new RegExp(`\\{\\{${k}\\}}`, 'g'), String(vars[k])), raw);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {isInitialized ? children : <div className="animate-pulse">Loading...</div>}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationsProvider');
  }
  return context;
};