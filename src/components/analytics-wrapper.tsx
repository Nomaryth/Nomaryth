'use client';

import { useEffect } from 'react';
import { Analytics } from "@vercel/analytics/next";
import { useCookiePreferences } from '@/hooks/use-cookie-preferences';

interface AnalyticsWrapperProps {
  children?: React.ReactNode;
}

export function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  const { hasAccepted, loading } = useCookiePreferences();

  useEffect(() => {
    if (!loading && hasAccepted('analytics')) {
      console.log('Analytics cookies accepted - tracking enabled');
    } else if (!loading) {
      console.log('Analytics cookies not accepted - tracking disabled');
    }
  }, [hasAccepted, loading]);

  if (loading || !hasAccepted('analytics')) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Analytics />
    </>
  );
}

export function useAnalyticsEnabled() {
  const { hasAccepted, loading } = useCookiePreferences();
  
  return {
    analyticsEnabled: !loading && hasAccepted('analytics'),
    loading
  };
}