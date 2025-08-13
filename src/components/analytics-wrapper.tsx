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
    // Only load analytics if user has accepted analytics cookies
    if (!loading && hasAccepted('analytics')) {
      // Analytics will be loaded via the Analytics component
      console.log('Analytics cookies accepted - tracking enabled');
    } else if (!loading) {
      console.log('Analytics cookies not accepted - tracking disabled');
    }
  }, [hasAccepted, loading]);

  // Only render Analytics component if analytics cookies are accepted
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

// Hook for components that need to check if they can track analytics
export function useAnalyticsEnabled() {
  const { hasAccepted, loading } = useCookiePreferences();
  
  return {
    analyticsEnabled: !loading && hasAccepted('analytics'),
    loading
  };
}
